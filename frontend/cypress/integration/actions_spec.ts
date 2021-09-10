import { EvaluationSeed } from '../support/evaluation_seed'
import { Progression, Priority, Role } from '../../src/api/models'
import { FUSION_DATE_LOCALE } from '../support/helpers'
import { barrierToString } from '../../src/utils/EnumToString'
import { Action, Note, Participant } from '../support/mocks'
import { ActionsGrid, ActionsTab, CreateActionDialog, EditActionDialog, mapPriority } from '../support/action'
import { EvaluationPage, QuestionnaireSidePanel } from '../support/evaluation'
import { ConfirmationDialog, DropdownSelect } from '../support/common'
import { DELETE_ACTION } from '../support/gql'
import * as faker from 'faker'
import { getUsers, User } from '../support/mock/external/users'

describe('Actions management', () => {
    const evaluationPage = new EvaluationPage()
    const actionsGrid = new ActionsGrid()
    const actionsTab = new ActionsTab()
    const questionnaireSidePanel = new QuestionnaireSidePanel()
    const confirmationDialog = new ConfirmationDialog()
    const createActionDialog = new CreateActionDialog()
    const editActionDialog = new EditActionDialog()
    const dropdownSelect = new DropdownSelect()

    let seed: EvaluationSeed
    const users = getUsers(4)
    const roles = [Role.Facilitator, Role.OrganizationLead, Role.Participant, Role.ReadOnly]
    const getRandomProgressionWorkshopOrFollowUp = () => {
        return faker.random.arrayElement([Progression.Workshop, Progression.FollowUp])
    }
    const logInRandomUser = (progression: Progression = getRandomProgressionWorkshopOrFollowUp()) => {
        const user = faker.random.arrayElement(users)
        cy.visitEvaluation(seed.evaluationId, user)
        evaluationPage.progressionStepLink(progression).click()
        return user
    }
    const logInUser = (role: Role, progression: Progression = getRandomProgressionWorkshopOrFollowUp()): User => {
        const participant = seed.participants.find(x => {
            return x.role === role
        })
        if (participant === undefined) {
            throw 'No user with role ' + role + ' found'
        }
        cy.visitEvaluation(seed.evaluationId, participant.user)
        evaluationPage.progressionStepLink(progression).click()
        return participant.user
    }

    beforeEach(() => {
        seed = createSeedWithActions(users, roles, { completed: false })
        seed.plant()
    })
    context('Creating and editing actions', () => {
        const roles = [
            {
                role: Role.Facilitator,
                canCreateAction: true,
            },
            {
                role: Role.OrganizationLead,
                canCreateAction: true,
            },
            {
                role: Role.Participant,
                canCreateAction: true,
            },
            {
                role: Role.ReadOnly,
                canCreateAction: false,
            },
        ]
        roles.forEach(r => {
            it(`${r.role} can create action = ${r.canCreateAction}`, () => {
                logInUser(r.role)
                let action = createActionTestData(users)
                r.canCreateAction
                    ? actionsGrid.addActionButton(action.questionOrder).should('be.enabled')
                    : actionsGrid.addActionButton(action.questionOrder).should('not.exist')
            })
        })

        const randomRole = faker.random.arrayElement([Role.Facilitator, Role.Participant, Role.OrganizationLead])

        it(`Action creation by ${randomRole} and verification that action was created`, () => {
            logInUser(randomRole)
            let action = createActionTestData(users)
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
                    evaluationPage.progressionStepLink(getRandomProgressionWorkshopOrFollowUp()).click()
                    actionsGrid.actionLink(action.questionOrder, action.title).should('exist')
                }
            )
        })

        let actionNotes: Note[]
        let action: Action
        let updatedAction: Action
        let newNotes: Note[]

        it(`Editing action by ${randomRole} - assign action, add notes and verify notes were added`, () => {
            let user = logInUser(randomRole)
            ;({ actionNotes, action } = findActionWithNotes(seed))
            ;({ updatedAction, newNotes } = createEditTestData(seed, user, action))

            actionsGrid.actionLink(action.questionOrder, action.title).click()

            editActionDialog.assertActionValues(action, actionNotes)
            editActionDialog.editAction(updatedAction, newNotes, actionNotes.length)
            editActionDialog.assertNotesValues(actionNotes.concat(newNotes))
            editActionDialog.close()

            cy.testCacheAndDB(() => {
                evaluationPage.progressionStepLink(getRandomProgressionWorkshopOrFollowUp()).click()
                actionsGrid.actionLink(action.questionOrder, updatedAction.title).click()
                editActionDialog.assertActionValues(updatedAction, actionNotes.concat(newNotes))
            })
        })
    })
    context('Deleting Actions', () => {
        const deleteAction = (actionToDelete: Action) => {
            actionsGrid.deleteActionButton(actionToDelete.id).click()
            confirmationDialog.yesButton().click()
        }

        const roles = [
            {
                role: Role.Facilitator,
                canDeleteAction: true,
                deleteButtonExists: true,
            },
            {
                role: Role.OrganizationLead,
                canDeleteAction: false,
                deleteButtonExists: false,
            },
            {
                role: Role.Participant,
                canDeleteAction: false,
                deleteButtonExists: false,
            },
            {
                role: Role.ReadOnly,
                canDeleteAction: false, // This value is irrelevant
                deleteButtonExists: false,
            },
        ]
        roles.forEach(r => {
            it(`${r.role} delete button exists = ${r.deleteButtonExists} can delete action = ${r.canDeleteAction}`, () => {
                logInUser(r.role)
                const { actionToDelete, actionToStay } = getActionToDeleteActionToStay()
                if (!r.deleteButtonExists) {
                    actionsGrid.deleteActionButton(actionToDelete.id).should('not.exist')
                } else {
                    deleteAction(actionToDelete)
                    if (r.canDeleteAction === false) {
                        cy.contains('are not allowed to perform this operation')
                    } else {
                        cy.testCacheAndDB(() => {
                            evaluationPage.progressionStepLink(getRandomProgressionWorkshopOrFollowUp()).click()
                            cy.contains(actionToDelete.title).should('not.exist')
                            cy.contains(actionToStay.title).should('exist')
                        })
                    }
                }
            })
        })

        const getActionToDeleteActionToStay = () => {
            let actions = faker.random.arrayElements(seed.actions, 2)
            let actionToDelete = actions[0]
            let actionToStay = actions[1]
            return { actionToDelete, actionToStay }
        }

        it(`Cancel delete action by Facilitator, then verify action was not deleted`, () => {
            logInUser(Role.Facilitator)
            const { actionToDelete, actionToStay } = getActionToDeleteActionToStay()
            actionsGrid.deleteActionButton(actionToDelete.id).click()
            confirmationDialog.noButton().click()

            cy.testCacheAndDB(() => {
                evaluationPage.progressionStepLink(getRandomProgressionWorkshopOrFollowUp()).click()
                cy.contains(actionToDelete.title).should('exist')
                cy.contains(actionToStay.title).should('exist')
            })
        })
        context('Error handling when facilitator has two browser windows open', () => {
            it('Deleted action in one window cannot be deleted in other window', () => {
                logInUser(Role.Facilitator)
                const { actionToDelete, actionToStay } = getActionToDeleteActionToStay()
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

                    deleteAction(actionToDelete)

                    cy.testCacheAndDB(
                        () => {
                            cy.contains(actionToStay.title).should('exist')
                            cy.contains('Action not found').should('exist')
                        },
                        () => {
                            evaluationPage.progressionStepLink(getRandomProgressionWorkshopOrFollowUp()).click()
                            cy.contains(actionToDelete.title).should('not.exist')
                            cy.contains(actionToStay.title).should('exist')
                            cy.contains('Action not found').should('not.exist')
                        }
                    )
                })
            })
        })
    })

    context('Viewing actions', () => {
        function getQuestion(action: Action) {
            return seed.questions.find(q => q.id === seed.findQuestionId(action.questionOrder))!
        }

        function checkActionsExistOnProgression() {
            let actions = seed.actions
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
            logInRandomUser(Progression.Workshop)
            checkActionsExistOnProgression()
        })

        it('Actions are visible on Follow-Up Progression', () => {
            logInRandomUser(Progression.FollowUp)
            checkActionsExistOnProgression()
        })

        it('Actions are visible on Follow-Up Actions Tab', () => {
            logInRandomUser(Progression.FollowUp)
            actionsTab.linkToTab().click()
            actionsTab.body().should('be.visible')
            let actions: Action[] = seed.actions
            actions.forEach(a => {
                const question = seed.questions.find(q => q.id === seed.findQuestionId(a.questionOrder))
                actionsTab.assertActionValues(a, question!)
            })
        })
    })
    context('Completing actions', () => {
        let action: Action
        let actionNotes: Note[]
        let updatedAction: Action
        let newNote: Note

        const roleThatCanComplete = faker.random.arrayElement([Role.Facilitator, Role.Participant, Role.OrganizationLead])
        const saveWithReason = faker.datatype.boolean()

        it(`Action can be completed by ${roleThatCanComplete} ${saveWithReason ? 'with a reason' : 'without a reason'}`, () => {
            let user = logInUser(roleThatCanComplete)
            ;({ actionNotes, action } = findActionWithNotes(seed))
            ;({ updatedAction, newNote } = createCompleteAction(user, action, saveWithReason))

            actionsGrid.actionLink(action.questionOrder, action.title).click()

            editActionDialog.assertCompletedInView(action.completed)
            editActionDialog.assertCompleteConfirmViewVisible(false)

            editActionDialog.completeActionButton().click()
            editActionDialog.assertCompleteConfirmViewVisible(true)

            editActionDialog.completedReasonInput().replace(newNote.text)
            editActionDialog.completeActionConfirmButton().click()

            editActionDialog.assertSaved()
            editActionDialog.actionCompletedText().should('exist')
            editActionDialog.assertClosingNoteExists(newNote)
            editActionDialog.close()

            cy.testCacheAndDB(() => {
                evaluationPage.progressionStepLink(getRandomProgressionWorkshopOrFollowUp()).click()
                actionsGrid.actionLink(updatedAction.questionOrder, updatedAction.title).click()
                editActionDialog.assertClosingNoteExists(newNote)
            })
        })

        it(`Completing Action can be cancelled by ${roleThatCanComplete}`, () => {
            let user = logInUser(roleThatCanComplete)
            ;({ actionNotes, action } = findActionWithNotes(seed))

            actionsGrid.actionLink(action.questionOrder, action.title).click()

            editActionDialog.assertCompletedInView(action.completed)

            editActionDialog.completeActionButton().click()

            editActionDialog.assertCompleteConfirmViewVisible(true)

            editActionDialog.completeActionCancelButton().click()

            editActionDialog.assertCompleteConfirmViewVisible(false)
            editActionDialog.actionCompletedText().should('not.exist')
            cy.contains('closed action').should('not.exist')
        })
    })
})

const findActionWithNotes = (seed: EvaluationSeed) => {
    const note = faker.random.arrayElement(seed.notes)
    const actionNotes = seed.notes.filter(x => {
        return (x.action.id = note.action.id)
    })
    const action = seed.actions.find(x => x.id === note.action.id)!
    return { actionNotes, action }
}

const createSeedWithActions = (users: User[], roles: Role[], actionParameters: Partial<Action>) => {
    const seed = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users,
        roles,
    })

    const oneAction = seed.createAction({
        ...actionParameters,
    })

    const existingNotes: Note[] = Array.from({ length: faker.datatype.number({ min: 1, max: 4 }) }, () => {
        return new Note({
            text: faker.lorem.sentence(),
            action: oneAction,
            createdBy: faker.random.arrayElement(seed.participants.filter(x => x.role !== Role.ReadOnly)),
        })
    })

    const moreActions: Action[] = Array.from({ length: faker.datatype.number({ min: 1, max: 2 }) }, () => {
        return seed.createAction({})
    })
    faker.helpers.shuffle([oneAction, ...moreActions]).forEach(a => seed.addAction(a))
    existingNotes.forEach(n => seed.addNote(n))

    return seed
}

const createActionTestData = (users: User[]) => {
    const assignableRoles = [Role.Participant, Role.Facilitator, Role.OrganizationLead]
    const assignedToParticipant: Participant = new Participant({
        user: faker.random.arrayElement(users),
        role: faker.random.arrayElement(assignableRoles),
        progression: faker.random.arrayElement(Object.values(Progression)),
    })
    const createdByParticipant: Participant = new Participant({
        user: faker.random.arrayElement(users),
        role: faker.random.arrayElement(assignableRoles),
        progression: faker.random.arrayElement(Object.values(Progression)),
    })
    const action = new Action({
        createdBy: createdByParticipant,
        questionOrder: faker.datatype.number({ min: 1, max: 2 }),
        title: 'New shiny issue!',
        assignedTo: assignedToParticipant,
        dueDate: faker.date.future(),
        priority: faker.random.arrayElement(Object.values(Priority)),
        description: faker.lorem.words(),
    })
    return action
}

const createEditTestData = (seed: EvaluationSeed, user: User, existingAction: Action) => {
    const assignableRoles = [Role.Participant, Role.Facilitator, Role.OrganizationLead]
    const updatedAction = { ...existingAction }
    updatedAction.title = 'Feel proud for me, I have been updated!'
    updatedAction.assignedTo = new Participant({
        user: user,
        role: faker.random.arrayElement(assignableRoles),
        progression: faker.random.arrayElement(Object.values(Progression)),
    })
    updatedAction.dueDate = faker.date.future()
    updatedAction.priority = faker.random.arrayElement(Object.values(Priority))
    updatedAction.description = faker.lorem.words()
    updatedAction.completed = !existingAction.completed
    updatedAction.onHold = !existingAction.onHold

    const newNotes: Note[] = Array.from({ length: faker.datatype.number({ min: 1, max: 3 }) }, () => {
        return new Note({
            text: faker.lorem.words(),
            action: updatedAction,
            createdBy: new Participant({
                user: user,
                role: faker.random.arrayElement(assignableRoles),
                progression: faker.random.arrayElement(Object.values(Progression)),
            }),
        })
    })

    return { updatedAction, newNotes }
}

const createCompleteAction = (user: User, existingAction: Action, saveWithReason: boolean) => {
    const assignableRoles = [Role.Participant, Role.Facilitator, Role.OrganizationLead]
    const updatedAction = { ...existingAction, completed: true }
    const newNote = new Note({
        text: saveWithReason ? 'Closed because of a good reason' : '',
        action: updatedAction,
        createdBy: new Participant({
            user,
            role: faker.random.arrayElement(assignableRoles),
            progression: faker.random.arrayElement(Object.values(Progression)),
        }),
        typeName: 'ClosingRemark',
    })
    return { updatedAction, newNote }
}
