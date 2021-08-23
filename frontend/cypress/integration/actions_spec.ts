import { EvaluationSeed } from '../support/evaluation_seed'
import { Progression, Priority } from '../../src/api/models'
import { FUSION_DATE_LOCALE } from '../support/helpers'
import { barrierToString, organizationToString } from '../../src/utils/EnumToString'
import { Action, Note, Participant } from '../support/mocks'
import { ActionsGrid, ActionsTab, CreateActionDialog, EditActionDialog, mapPriority } from '../support/action'
import { EvaluationPage, QuestionnaireSidePanel } from '../support/evaluation'
import { ConfirmationDialog, DropdownSelect } from '../support/common'
import { DELETE_ACTION } from '../support/gql'
import { createParticipants } from '../testdata/participants'
import * as faker from 'faker'
import { getUsers } from '../support/mock/external/users'

describe('Actions', () => {
    const evaluationPage = new EvaluationPage()
    const actionsGrid = new ActionsGrid()
    const actionsTab = new ActionsTab()
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
            ;({ seed, existingAction, existingNotes } = createEditSeed())
            editor = faker.random.arrayElement(seed.participants)
            ;({ updatedAction, newNotes } = createEditTestData(seed, editor, existingAction))

            seed.plant().then(() => {
                cy.visitEvaluation(seed.evaluationId, editor.user)
                evaluationPage.progressionStepLink(actionProgression).click()
            })
        })

        it('Action can be edited', () => {
            actionsGrid.actionLink(existingAction.questionOrder, existingAction.title).click()
            editActionDialog.assertActionValues(existingAction, existingNotes)

            editActionDialog.titleInput().replace(updatedAction.title)
            dropdownSelect.select(editActionDialog.assignedToInput(), updatedAction.assignedTo.user.name)
            editActionDialog.dueDateInput().replace(updatedAction.dueDate.toLocaleDateString(FUSION_DATE_LOCALE))
            dropdownSelect.select(editActionDialog.priorityInput(), mapPriority(updatedAction.priority))
            editActionDialog.descriptionInput().replace(updatedAction.description)
            newNotes.forEach(note => {
                editActionDialog.notesInput().replace(note.text)
                editActionDialog.addNoteButton().click()
            })
            editActionDialog.completedSwitch().click({ force: true })
            editActionDialog.onHoldSwitch().click({ force: true })

            editActionDialog.assertSaved()
            editActionDialog.close()
            cy.testCacheAndDB(() => {
                evaluationPage.progressionStepLink(actionProgression).click()
                actionsGrid.actionLink(existingAction.questionOrder, updatedAction.title).click()
                editActionDialog.assertActionValues(updatedAction, existingNotes.concat(newNotes))
            })
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
                const user = faker.random.arrayElement(seed.participants).user
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

        beforeEach(() => {
            ;({ seed, actions } = createViewSeed())

            seed.plant().then(() => {
                const user = faker.random.arrayElement(seed.participants).user
                cy.visitEvaluation(seed.evaluationId, user)
            })
        })

        context('Created actions are visible', () => {
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
                evaluationPage.progressionStepLink(Progression.Workshop).click()
                checkActionsPresentOnProgression()
            })

            it('Actions are visible on Follow-Up Progression', () => {
                evaluationPage.progressionStepLink(Progression.FollowUp).click()
                checkActionsPresentOnProgression()
            })

            it('Actions are visible on Follow-Up Actions Tab', () => {
                evaluationPage.progressionStepLink(Progression.FollowUp).click()
                actionsTab.linkToTab().click()
                actionsTab.body().should('be.visible')
                actions.forEach(a => {
                    const question = seed.questions.find(q => q.id === seed.findQuestionId(a.questionOrder))
                    actionsTab.assertActionValues(a, question!)
                })
            })
        })
    })
})

const createCreateSeed = () => {
    const users = getUsers(faker.datatype.number({ min: 1, max: 4 }))
    const progression = faker.random.arrayElement(Object.values(Progression))
    const seed = new EvaluationSeed({
        progression: progression,
        participants: createParticipants({ users: users, progression: progression }),
    })

    const existingActions: Action[] = Array.from({ length: faker.datatype.number({ min: 0, max: 3 }) }, () => {
        return seed.createAction({})
    })
    existingActions.forEach(a => seed.addAction(a))

    return { seed }
}

const createEditSeed = () => {
    const users = getUsers(faker.datatype.number({ min: 1, max: 4 }))
    const progression = faker.random.arrayElement(Object.values(Progression))
    const seed = new EvaluationSeed({
        progression: progression,
        participants: createParticipants({ users: users, progression: progression }),
    })

    const existingAction = seed.createAction({
        title: 'Just some random action',
    })
    const existingNotes: Note[] = Array.from({ length: faker.datatype.number({ min: 1, max: 4 }) }, () => {
        return new Note({
            text: faker.lorem.sentence(),
            action: existingAction,
            createdBy: faker.random.arrayElement(seed.participants),
        })
    })

    const otherActions: Action[] = Array.from({ length: faker.datatype.number({ min: 0, max: 2 }) }, () => {
        return seed.createAction({})
    })
    faker.helpers.shuffle([existingAction, ...otherActions]).forEach(a => seed.addAction(a))
    existingNotes.forEach(n => seed.addNote(n))

    return { seed, existingAction, existingNotes }
}

const createDeleteSeed = () => {
    const progression = faker.random.arrayElement(Object.values(Progression))
    const users = getUsers(faker.datatype.number({ min: 1, max: 5 }))
    const seed = new EvaluationSeed({
        progression: progression,
        participants: createParticipants({ users: users, progression: progression }),
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

const createViewSeed = () => {
    const users = getUsers(faker.datatype.number({ min: 1, max: 5 }))
    const progression = faker.random.arrayElement(Object.values(Progression))
    const seed = new EvaluationSeed({
        progression: progression,
        participants: createParticipants({ users: users, progression: progression }),
    })

    const actions: Action[] = Array.from({ length: faker.datatype.number({ min: 2, max: 4 }) }, () => {
        return seed.createAction({ questionOrder: faker.datatype.number({ min: 1, max: 8 }) })
    })
    faker.helpers.shuffle([...actions]).forEach(a => seed.addAction(a))

    return { seed, actions }
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

const createEditTestData = (seed: EvaluationSeed, editor: Participant, existingAction: Action) => {
    const updatedAction = { ...existingAction }
    updatedAction.title = 'Feel proud for me, I have been updated!'
    updatedAction.assignedTo = faker.random.arrayElement(seed.participants)
    updatedAction.dueDate = faker.date.future()
    updatedAction.priority = faker.random.arrayElement(Object.values(Priority))
    updatedAction.description = faker.lorem.words()
    updatedAction.completed = !existingAction.completed
    updatedAction.onHold = !existingAction.onHold

    const newNotes: Note[] = Array.from({ length: faker.datatype.number({ min: 1, max: 3 }) }, () => {
        return new Note({
            text: faker.lorem.words(),
            action: updatedAction,
            createdBy: editor,
        })
    })

    return { updatedAction, newNotes }
}
