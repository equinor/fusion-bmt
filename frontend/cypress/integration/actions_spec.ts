import { EvaluationSeed } from '../support/evaluation_seed'
import { Progression, Priority, Role } from '../../src/api/models'
import { FUSION_DATE_LOCALE } from '../support/helpers'
import { barrierToString } from '../../src/utils/EnumToString'
import { Action, Note, Participant } from '../support/mocks'
import { ActionsGrid, ActionsTab, CreateActionDialog, DashboardActions, EditActionDialog, mapPriority } from '../support/action'
import { EvaluationPage, QuestionnaireSidePanel } from '../support/evaluation'
import { ConfirmationDialog, DropdownSelect } from '../support/common'
import { DELETE_ACTION } from '../support/gql'
import * as faker from 'faker'
import { getUsers } from '../support/mock/external/users'

describe('Actions', () => {
    const evaluationPage = new EvaluationPage()
    const actionsGrid = new ActionsGrid()
    const actionsTab = new ActionsTab()
    const dashboardActions = new DashboardActions()
    const questionnaireSidePanel = new QuestionnaireSidePanel()
    const confirmationDialog = new ConfirmationDialog()
    const createActionDialog = new CreateActionDialog()
    const editActionDialog = new EditActionDialog()
    const dropdownSelect = new DropdownSelect()

    context('Create', () => {
        let seed: EvaluationSeed
        let action: Action
        const createActionFrom = faker.random.arrayElement([Progression.Workshop, Progression.FollowUp])

        beforeEach(() => {
            ;({ seed } = createCreateSeed())
            const creator = faker.random.arrayElement(seed.participants)
            ;({ action } = createCreateTestData(seed, creator))

            seed.plant().then(() => {
                cy.visitEvaluation(seed.evaluationId, creator.user)
                evaluationPage.progressionStepLink(createActionFrom).click()
            })
        })

        it('Action can be created', () => {
            actionsGrid.addActionButton(action.questionOrder).click()
            createActionDialog.titleInput().type(action.title)
            createActionDialog.assignedToInput().click()
            dropdownSelect.assertSelectValues(
                seed.participants.map(p => {
                    return p.user.name
                })
            )
            dropdownSelect.select(createActionDialog.assignedToInput(), action.assignedTo.user.name)
            createActionDialog.dueDateInput().replace(action.dueDate.toLocaleDateString(FUSION_DATE_LOCALE))
            createActionDialog.priorityInput().click()
            dropdownSelect.assertSelectValues(
                Object.values(Priority).map(p => {
                    return mapPriority(p)
                })
            )
            dropdownSelect.select(createActionDialog.priorityInput(), mapPriority(action.priority))
            createActionDialog.body().contains(`Connected to ${seed.name}`).should('exist')
            createActionDialog.descriptionInput().type(action.description)

            createActionDialog.createButton().click()
            cy.testCacheAndDB(
                () => {
                    createActionDialog.body().should('not.exist')
                    actionsGrid.actionLink(action.questionOrder, action.title).should('exist')
                },
                () => {
                    evaluationPage.progressionStepLink(createActionFrom).click()
                    actionsGrid.actionLink(action.questionOrder, action.title).should('exist')
                }
            )
        })
    })

    context('Edit', () => {
        let seed: EvaluationSeed
        let editor: Participant

        let existingAction: Action
        let existingNotes: Note[]
        let updatedAction: Action
        let newNotes: Note[]

        const actionProgression = faker.random.arrayElement([Progression.Workshop, Progression.FollowUp])

        beforeEach(() => {
            ;({ seed, editor, existingAction, existingNotes } = createEvaluationWithActionsWithNotes({ title: 'Just some random action' }))
            ;({ updatedAction, newNotes } = createEditTestData(seed, editor, existingAction))

            seed.plant().then(() => {
                cy.visitEvaluation(seed.evaluationId, editor.user)
                evaluationPage.progressionStepLink(actionProgression).click()
            })
        })

        it('Action can be edited', () => {
            actionsGrid.actionLink(existingAction.questionOrder, existingAction.title).click()
            editActionDialog.assertActionValues(existingAction, existingNotes)
            editActionDialog.editAction(updatedAction, newNotes, dropdownSelect)
            editActionDialog.assertSaved()
            editActionDialog.assertActionValues(updatedAction, existingNotes.concat(newNotes))
            editActionDialog.close()

            cy.testCacheAndDB(() => {
                evaluationPage.progressionStepLink(actionProgression).click()
                actionsGrid.actionLink(existingAction.questionOrder, updatedAction.title).click()
                editActionDialog.assertActionValues(updatedAction, existingNotes.concat(newNotes))
            })
        })
    })

    context('Complete action', () => {
        let seed: EvaluationSeed
        let editor: Participant
        let existingAction: Action
        let existingNotes: Note[]

        beforeEach(() => {
            ;({ seed, editor, existingAction, existingNotes } = createEvaluationWithActionsWithNotes({ completed: false }))

            seed.plant()
        })

        const actionProgression = faker.random.arrayElement([Progression.Workshop, Progression.FollowUp])

        function openActionEditView() {
            cy.visitEvaluation(seed.evaluationId, editor.user)
            evaluationPage.progressionStepLink(actionProgression).click()
            actionsGrid.actionLink(existingAction.questionOrder, existingAction.title).click()
        }

        function testViewAfterReload(newNote: Note) {
            cy.testCacheAndDB(() => {
                evaluationPage.progressionStepLink(actionProgression).click()
                actionsGrid.actionLink(existingAction.questionOrder, existingAction.title).click()
                editActionDialog.assertClosingMessageInNotes(newNote, 0)
            })
        }

        it('Action can be completed', () => {
            const saveWithReason = faker.datatype.boolean()
            const newNote = createCompleteNote(existingAction, editor)

            openActionEditView()

            editActionDialog.assertViewActionNotCompleted()
            editActionDialog.openCompleteActionView()
            if (saveWithReason) {
                editActionDialog.completedReasonInput().replace('Closed because of a good reason')
            }
            editActionDialog.confirmAndCheckCompleted()
            editActionDialog.assertClosingMessageInNotes(newNote, 0)
            editActionDialog.close()
            testViewAfterReload(newNote)
        })

        it('Completing Action can be cancelled', () => {
            openActionEditView()

            editActionDialog.completeActionButton().click()
            editActionDialog.completeActionCancelButton().click()
            editActionDialog.assertViewActionNotCompleted()
            editActionDialog.assertNoClosingMessageInNotes(existingNotes)
        })
    })

    context('Delete', () => {
        let seed: EvaluationSeed
        let actionToDelete: Action
        let actionToStay: Action

        const deleteActionFrom = faker.random.arrayElement([Progression.Workshop, Progression.FollowUp])

        beforeEach(() => {
            ;({ seed, actionToDelete, actionToStay } = createDeleteSeed())

            seed.plant().then(() => {
                const user = faker.random.arrayElement(seed.participants.filter(x => x.role === Role.Facilitator)).user
                cy.visitEvaluation(seed.evaluationId, user)
                evaluationPage.progressionStepLink(deleteActionFrom).click()
                cy.contains(actionToDelete.title).should('exist')
                cy.contains(actionToStay.title).should('exist')
            })
        })

        const deleteAction = () => {
            actionsGrid.deleteActionButton(actionToDelete.id).click()
            confirmationDialog.yesButton().click()
        }

        it('Action can be deleted', () => {
            deleteAction()
            cy.testCacheAndDB(() => {
                evaluationPage.progressionStepLink(deleteActionFrom).click()
                cy.contains(actionToDelete.title).should('not.exist')
                cy.contains(actionToStay.title).should('exist')
            })
        })

        it('Action delete may be canceled', () => {
            actionsGrid.deleteActionButton(actionToDelete.id).click()
            confirmationDialog.noButton().click()

            cy.testCacheAndDB(() => {
                evaluationPage.progressionStepLink(deleteActionFrom).click()
                cy.contains(actionToDelete.title).should('exist')
                cy.contains(actionToStay.title).should('exist')
            })
        })

        it('Deleted action can not be deleted again', () => {
            cy.gql(DELETE_ACTION, {
                variables: {
                    actionId: actionToDelete.id,
                },
            }).then(() => {
                cy.on('uncaught:exception', (err, runnable) => {
                    if (err.message.includes('Action not found')) {
                        console.log("Swallowing unhandled 'Action not found'")
                        return false
                    }
                })

                cy.login(seed.participants[0].user)
                deleteAction()

                cy.testCacheAndDB(
                    () => {
                        cy.contains(actionToStay.title).should('exist')
                        cy.contains('Action not found').should('exist')
                    },
                    () => {
                        evaluationPage.progressionStepLink(deleteActionFrom).click()
                        cy.contains(actionToDelete.title).should('not.exist')
                        cy.contains(actionToStay.title).should('exist')
                        cy.contains('Action not found').should('not.exist')
                    }
                )
            })
        })
    })

    context('View', () => {
        let seed: EvaluationSeed
        let actions: Action[]
        let editor: Participant

        context('Created actions are visible in action tables with actions from all users', () => {
            beforeEach(() => {
                ;({ seed, editor, actions } = createViewSeed())
                seed.plant()
            })

            function getQuestion(action: Action) {
                return seed.questions.find(q => q.id === seed.findQuestionId(action.questionOrder))!
            }

            function checkActionsPresentOnProgression() {
                actions.forEach(a => {
                    questionnaireSidePanel
                        .body()
                        .contains(barrierToString(getQuestion(a).barrier))
                        .click()
                    actionsGrid.actionLink(a.questionOrder, a.title).should('exist')
                    actionsGrid.actionCompleteDiv(a.id).should(a.completed ? 'exist' : 'not.exist')
                })
            }

            it('Actions are visible on Workshop Progression', () => {
                cy.visitEvaluation(seed.evaluationId, editor.user)
                evaluationPage.progressionStepLink(Progression.Workshop).click()
                checkActionsPresentOnProgression()
            })

            it('Actions are visible on Follow-Up Progression', () => {
                cy.visitEvaluation(seed.evaluationId, editor.user)
                evaluationPage.progressionStepLink(Progression.FollowUp).click()
                checkActionsPresentOnProgression()
            })

            it('Actions are visible on Follow-Up Actions Tab', () => {
                cy.visitEvaluation(seed.evaluationId, editor.user)
                evaluationPage.progressionStepLink(Progression.FollowUp).click()
                actionsTab.linkToTab().click()
                actionsTab.body().should('be.visible')
                actions.forEach(a => {
                    const question = seed.questions.find(q => q.id === seed.findQuestionId(a.questionOrder))
                    actionsTab.assertActionValues(a, question!)
                })
            })
        })

        context('Created actions are visible in action table with one users actions', () => {
            beforeEach(() => {
                ;({ seed, editor, actions } = createViewSeed(true))
                seed.plant()
            })

            it('Actions are visible on Dashboard Actions Tab', () => {
                cy.visitProject(editor.user)
                dashboardActions.tab().click()
                actions.forEach(a => {
                    const question = seed.questions.find(q => q.id === seed.findQuestionId(a.questionOrder))
                    dashboardActions.assertActionValues(a, question!, seed)
                })
            })
        })
    })

    context('Actions Tab on Dashboard', () => {
        let seed: EvaluationSeed
        let editor: Participant
        let existingAction: Action
        let existingNotes: Note[]

        beforeEach(() => {
            ;({ seed, editor, existingAction, existingNotes } = createActionTableSeed())
            seed.plant()
        })

        function openEditActionView(actionTitle: string) {
            dashboardActions.tab().click()
            dashboardActions.actionLink(existingAction.id, actionTitle).click()
        }

        it('Action can be edited', () => {
            const { updatedAction, newNotes } = createEditTestData(seed, editor, existingAction, false)

            cy.visitProject(editor.user)
            openEditActionView(existingAction.title)

            editActionDialog.assertActionValues(existingAction, existingNotes)
            editActionDialog.editAction(updatedAction, newNotes, dropdownSelect)
            editActionDialog.assertSaved()
            editActionDialog.assertActionValues(updatedAction, existingNotes.concat(newNotes))
            editActionDialog.close()

            cy.testCacheAndDB(() => {
                openEditActionView(updatedAction.title)
                editActionDialog.assertActionValues(updatedAction, existingNotes.concat(newNotes))
            })
        })

        it('Action can be completed', () => {
            const saveWithReason = faker.datatype.boolean()
            const newNote = createCompleteNote(existingAction, editor)

            cy.visitProject(editor.user)
            openEditActionView(existingAction.title)

            editActionDialog.openCompleteActionView()
            if (saveWithReason) {
                editActionDialog.completedReasonInput().replace('Closed because of a good reason')
            }
            editActionDialog.confirmAndCheckCompleted()
            editActionDialog.assertClosingMessageInNotes(newNote, 0)
            editActionDialog.close()

            cy.testCacheAndDB(() => {
                openEditActionView(existingAction.title)
                editActionDialog.assertClosingMessageInNotes(newNote, 0)
            })
        })
    })

    context('Actions Tab on Follow-Up page', () => {
        let seed: EvaluationSeed
        let editor: Participant

        let existingAction: Action
        let existingNotes: Note[]

        function navigateToView(actionTitle: string) {
            evaluationPage.progressionStepLink(Progression.FollowUp).click()
            actionsTab.linkToTab().click()
            actionsTab.actionLink(existingAction.id, actionTitle).click()
        }

        beforeEach(() => {
            ;({ seed, editor, existingAction, existingNotes } = createActionTableSeed())
            seed.plant()
        })

        it('Action can be edited', () => {
            const { updatedAction, newNotes } = createEditTestData(seed, editor, existingAction)

            cy.visitEvaluation(seed.evaluationId, editor.user)
            navigateToView(existingAction.title)

            editActionDialog.assertActionValues(existingAction, existingNotes)
            editActionDialog.editAction(updatedAction, newNotes, dropdownSelect)
            editActionDialog.assertSaved()
            editActionDialog.assertActionValues(updatedAction, existingNotes.concat(newNotes))
            editActionDialog.close()

            cy.testCacheAndDB(() => {
                navigateToView(updatedAction.title)
                editActionDialog.assertActionValues(updatedAction, existingNotes.concat(newNotes))
            })
        })

        it('Action can be completed', () => {
            const saveWithReason = faker.datatype.boolean()
            const { updatedAction: completedAction, newNote } = createCompleteActionData(seed, editor, existingAction)

            cy.visitEvaluation(seed.evaluationId, editor.user)
            navigateToView(existingAction.title)

            editActionDialog.openCompleteActionView()
            if (saveWithReason) {
                editActionDialog.completedReasonInput().replace('Closed because of a good reason')
            }
            editActionDialog.confirmAndCheckCompleted()
            editActionDialog.assertClosingMessageInNotes(newNote, 0)
            editActionDialog.close()

            cy.testCacheAndDB(() => {
                navigateToView(completedAction.title)
                editActionDialog.assertClosingMessageInNotes(newNote, 0)
            })
        })
    })
})

const createCreateSeed = () => {
    const progression = faker.random.arrayElement(Object.values(Progression))
    const seed = new EvaluationSeed({
        progression: progression,
        users: getUsers(faker.datatype.number({ min: 1, max: 4 })),
    })

    const existingActions: Action[] = Array.from({ length: faker.datatype.number({ min: 0, max: 3 }) }, () => {
        return seed.createAction({})
    })

    existingActions.forEach(a => seed.addAction(a))

    return { seed }
}

const createEvaluationWithActionsWithNotes = (actionParameters: Partial<Action>) => {
    const seed = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users: getUsers(faker.datatype.number({ min: 1, max: 4 })),
    })

    const editor = faker.random.arrayElement(seed.participants)

    const { existingAction, existingNotes } = addActionsAndNotesToEvaluation(seed, actionParameters)

    return { seed, editor, existingAction, existingNotes }
}

const addActionsAndNotesToEvaluation = (seed: EvaluationSeed, actionParameters: Partial<Action>) => {
    const existingAction = seed.createAction({
        ...actionParameters,
    })

    const existingNotes: Note[] = Array.from({ length: faker.datatype.number({ min: 1, max: 4 }) }, () => {
        return new Note({
            text: faker.lorem.sentence(),
            action: existingAction,
            createdBy: faker.random.arrayElement(seed.participants),
        })
    })

    const otherActions: Action[] = Array.from({ length: faker.datatype.number({ min: 0, max: 5 }) }, () => {
        return seed.createAction({})
    })
    faker.helpers.shuffle([existingAction, ...otherActions]).forEach(a => seed.addAction(a))
    existingNotes.forEach(n => seed.addNote(n))

    return { existingAction, existingNotes }
}

const createDeleteSeed = () => {
    const seed = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users: getUsers(faker.datatype.number({ min: 1, max: 5 })),
    })

    const actionToDelete = seed.createAction({
        title: 'You shall be murdered! 😇',
        description: 'Naughty, naughty action!',
    })
    const actionToStay = seed.createAction({
        title: 'You have my permission to live 😈',
    })
    const otherActions: Action[] = Array.from({ length: faker.datatype.number({ min: 0, max: 5 }) }, () => {
        return seed.createAction({})
    })
    faker.helpers.shuffle([actionToDelete, actionToStay, ...otherActions]).forEach(a => seed.addAction(a))

    return { seed, actionToDelete, actionToStay }
}

const createActionTableSeed = () => {
    const seed = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users: getUsers(faker.datatype.number({ min: 1, max: 4 })),
    })
    const editor = faker.random.arrayElement(seed.participants)
    const { existingAction, existingNotes } = addActionsAndNotesToEvaluation(seed, {
        title: 'My test action',
        assignedTo: editor,
        completed: false,
    })

    return { seed, editor, existingAction, existingNotes }
}

const createViewSeed = (putAllActionsOnEditor = false) => {
    const seed = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users: getUsers(faker.datatype.number({ min: 1, max: 5 })),
    })

    const editor = faker.random.arrayElement(seed.participants)
    const preassignedActionValues: Partial<Action> = { questionOrder: faker.datatype.number({ min: 1, max: 8 }) }

    if (putAllActionsOnEditor) {
        preassignedActionValues.assignedTo = editor
    }

    const actions: Action[] = Array.from({ length: faker.datatype.number({ min: 2, max: 4 }) }, () => {
        return seed.createAction(preassignedActionValues)
    })
    faker.helpers.shuffle([...actions]).forEach(a => seed.addAction(a))

    return { seed, editor, actions }
}

const createCreateTestData = (seed: EvaluationSeed, creator: Participant) => {
    const action = new Action({
        createdBy: creator,
        questionOrder: faker.datatype.number({ min: 1, max: 2 }),
        title: 'New shiny issue!',
        assignedTo: faker.random.arrayElement(seed.participants),
        dueDate: faker.date.future(),
        priority: faker.random.arrayElement(Object.values(Priority)),
        description: faker.lorem.words(),
    })
    return { action }
}

const createEditTestData = (seed: EvaluationSeed, editor: Participant, existingAction: Action, changeAssignedTo = true) => {
    const updatedAction = { ...existingAction }
    updatedAction.title = 'Feel proud for me, I have been updated!'
    if (changeAssignedTo) {
        updatedAction.assignedTo = faker.random.arrayElement(seed.participants)
    }
    updatedAction.dueDate = faker.date.future()
    updatedAction.priority = faker.random.arrayElement(Object.values(Priority))
    updatedAction.description = faker.lorem.words()

    const newNotes: Note[] = Array.from({ length: faker.datatype.number({ min: 1, max: 3 }) }, () => {
        return new Note({
            text: faker.lorem.words(),
            action: updatedAction,
            createdBy: editor,
        })
    })

    return { updatedAction, newNotes }
}

const createCompleteActionData = (seed: EvaluationSeed, editor: Participant, existingAction: Action) => {
    const updatedAction = { ...existingAction, completed: true }
    const newNote = createCompleteNote(updatedAction, editor)

    return { updatedAction, newNote }
}

const createCompleteNote = (action: Action, editor: Participant) => {
    const newNote = new Note({
        text: '',
        action: action,
        createdBy: editor,
        typeName: 'ClosingRemark',
    })

    return newNote
}
