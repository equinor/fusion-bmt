import { EvaluationSeed } from '../support/evaluation_seed'
import { Progression, Priority } from '../../src/api/models'
import { FUSION_DATE_LOCALE } from '../support/helpers'
import { barrierToString, organizationToString } from '../../src/utils/EnumToString'
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
    const users = getUsers(faker.datatype.number({ min: 3, max: 4 }))
    const logInSomeRandomUser = (progression: Progression = faker.random.arrayElement([Progression.Workshop, Progression.FollowUp])) => {
        const user = faker.random.arrayElement(users)
        cy.visitEvaluation(seed.evaluationId, user)
        evaluationPage.progressionStepLink(progression).click()
    }

    describe('Creating and Editing Actions', () => {
        beforeEach(() => {
            seed = createSeedWithActions(users)
            seed.plant()
        })
        it('Action can be created', () => {
            const creator = faker.random.arrayElement(users)
            cy.visitEvaluation(seed.evaluationId, creator)
            const createActionFrom = faker.random.arrayElement([Progression.Workshop, Progression.FollowUp])
            evaluationPage.progressionStepLink(createActionFrom).click()
            let actionTestData = createActionTestData(users)
            actionsGrid.addActionButton(actionTestData.questionOrder).click()
            createActionDialog.titleInput().type(actionTestData.title)
            createActionDialog.assignedToInput().click()
            dropdownSelect.assertSelectValues(
                seed.participants.map(p => {
                    return p.user.name
                })
            )
            dropdownSelect.select(createActionDialog.assignedToInput(), actionTestData.assignedTo.user.name)
            createActionDialog.dueDateInput().replace(actionTestData.dueDate.toLocaleDateString(FUSION_DATE_LOCALE))
            createActionDialog.priorityInput().click()
            dropdownSelect.assertSelectValues(
                Object.values(Priority).map(p => {
                    return mapPriority(p)
                })
            )
            dropdownSelect.select(createActionDialog.priorityInput(), mapPriority(actionTestData.priority))
            createActionDialog.body().contains(`Connected to ${seed.name}`).should('exist')
            createActionDialog.descriptionInput().type(actionTestData.description)

            createActionDialog.createButton().click()
            cy.testCacheAndDB(
                () => {
                    createActionDialog.body().should('not.exist')
                    actionsGrid.actionLink(actionTestData.questionOrder, actionTestData.title).should('exist')
                },
                () => {
                    evaluationPage.progressionStepLink(createActionFrom).click()
                    actionsGrid.actionLink(actionTestData.questionOrder, actionTestData.title).should('exist')
                }
            )
        })

        let notesOfSomeAction: Note[]
        let someAction: Action
        let updatedAction: Action
        let newNotes: Note[]

        it('Action can be edited', () => {
            let user = faker.random.arrayElement(users)
            cy.visitEvaluation(seed.evaluationId, user)
            const actionProgression = faker.random.arrayElement([Progression.Workshop, Progression.FollowUp])
            evaluationPage.progressionStepLink(actionProgression).click()
            ;({ notesOfSomeAction, someAction } = findActionWithNotes(seed))
            actionsGrid.actionLink(someAction.questionOrder, someAction.title).click()
            editActionDialog.assertActionValues(someAction, notesOfSomeAction)
            ;({ updatedAction, newNotes } = createEditTestData(seed, user, someAction))
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
                actionsGrid.actionLink(someAction.questionOrder, updatedAction.title).click()
                editActionDialog.assertActionValues(updatedAction, notesOfSomeAction.concat(newNotes))
            })
        })
        const deleteActionFrom = faker.random.arrayElement([Progression.Workshop, Progression.FollowUp])

        // const logInSomeRandomUser = (
        //     progression: Progression = faker.random.arrayElement([Progression.Workshop, Progression.FollowUp])
        // ) => {
        //     const user = faker.random.arrayElement(users)
        //     cy.visitEvaluation(seed.evaluationId, user)
        //     evaluationPage.progressionStepLink(progression).click()
        // }

        const deleteAction = (actionToDelete: Action) => {
            actionsGrid.deleteActionButton(actionToDelete.id).click()
            confirmationDialog.yesButton().click()
        }

        it('Action can be deleted', () => {
            logInSomeRandomUser()
            let actions = findSomeActions(seed, 2)
            let actionToDelete = actions[0]
            let actionToStay = actions[1]
            deleteAction(actionToDelete)
            cy.testCacheAndDB(() => {
                evaluationPage.progressionStepLink(deleteActionFrom).click()
                cy.contains(actionToDelete.title).should('not.exist')
                cy.contains(actionToStay.title).should('exist')
            })
        })

        it('Action delete may be canceled', () => {
            logInSomeRandomUser()
            let actions = findSomeActions(seed, 2)
            let actionToDelete = actions[0]
            let actionToStay = actions[1]
            actionsGrid.deleteActionButton(actionToDelete.id).click()
            confirmationDialog.noButton().click()

            cy.testCacheAndDB(() => {
                evaluationPage.progressionStepLink(deleteActionFrom).click()
                cy.contains(actionToDelete.title).should('exist')
                cy.contains(actionToStay.title).should('exist')
            })
        })

        it('Deleted action can not be deleted again', () => {
            logInSomeRandomUser()
            let actions = findSomeActions(seed, 2)
            let actionToDelete = actions[0]
            let actionToStay = actions[1]
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
                        evaluationPage.progressionStepLink(deleteActionFrom).click()
                        cy.contains(actionToDelete.title).should('not.exist')
                        cy.contains(actionToStay.title).should('exist')
                        cy.contains('Action not found').should('not.exist')
                    }
                )
            })
        })

        function getQuestion(action: Action) {
            return seed.questions.find(q => q.id === seed.findQuestionId(action.questionOrder))!
        }

        function checkActionsPresentOnProgression() {
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
            logInSomeRandomUser(Progression.Workshop)
            checkActionsPresentOnProgression()
        })

        it('Actions are visible on Follow-Up Progression', () => {
            logInSomeRandomUser(Progression.FollowUp)
            checkActionsPresentOnProgression()
        })

        it('Actions are visible on Follow-Up Actions Tab', () => {
            logInSomeRandomUser(Progression.FollowUp)
            actionsTab.linkToTab().click()
            actionsTab.body().should('be.visible')
            let actions: Action[] = seed.actions
            actions.forEach(a => {
                const question = seed.questions.find(q => q.id === seed.findQuestionId(a.questionOrder))
                actionsTab.assertActionValues(a, question!)
            })
        })
    })
})

const findActionWithNotes = (seed: EvaluationSeed) => {
    const note = faker.random.arrayElement(seed.notes)
    const notesOfSomeAction = seed.notes.filter(x => {
        return (x.action.id = note.action.id)
    })
    const someAction = seed.actions.find(x => x.id === note.action.id)!
    return { notesOfSomeAction, someAction }
}

const findSomeActions = (seed: EvaluationSeed, no: number = 1) => {
    return faker.random.arrayElements(seed.actions, no)
}
const createSeedWithActions = (users: User[]) => {
    const seed = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users: users,
    })

    const oneAction = seed.createAction({
        title: 'Just some random action',
    })
    const existingNotes: Note[] = Array.from({ length: faker.datatype.number({ min: 1, max: 4 }) }, () => {
        return new Note({
            text: faker.lorem.sentence(),
            action: oneAction,
            createdBy: faker.random.arrayElement(seed.participants),
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
    const assignedToParticipant: Participant = new Participant({ user: faker.random.arrayElement(users) })
    const createdByParticipant: Participant = new Participant({ user: faker.random.arrayElement(users) })
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
            createdBy: new Participant({ user: user }),
        })
    })

    return { updatedAction, newNotes }
}
