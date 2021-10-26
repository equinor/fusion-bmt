import { EvaluationSeed } from '../support/testsetup/evaluation_seed'
import { Progression, Priority, Role } from '../../src/api/models'
import { FUSION_DATE_LOCALE } from '../support/helpers/helpers'
import { barrierToString } from '../../src/utils/EnumToString'
import { Action, Note, Participant } from '../support/testsetup/mocks'
import { ActionsGrid, CreateActionDialog, EditActionDialog, mapPriority } from '../page_objects/action'
import { EvaluationPage, QuestionnaireSidePanel } from '../page_objects/evaluation'
import { ConfirmationDialog, DropdownSelect } from '../page_objects/common'
import * as faker from 'faker'
import { getUsers, User } from '../support/mock/external/users'
import { fusionProject1 } from '../support/mock/external/projects'
import FollowUpTabs from '../page_objects/followup'
import { ActionTable } from '../page_objects/action-table'

describe('Actions management', () => {
    const evaluationPage = new EvaluationPage()
    const actionsGrid = new ActionsGrid()
    const questionnaireSidePanel = new QuestionnaireSidePanel()
    const confirmationDialog = new ConfirmationDialog()
    const createActionDialog = new CreateActionDialog()
    const editActionDialog = new EditActionDialog()
    const dropdownSelect = new DropdownSelect()
    const followUpTabs = new FollowUpTabs()
    const actionTable = new ActionTable()

    let seed: EvaluationSeed
    const users = getUsers(3)
    const roles = [Role.Facilitator, Role.OrganizationLead, Role.Participant]
    const progressionsWorkshopOrFollowUp = [Progression.Workshop, Progression.FollowUp]

    const getRandomProgressionWorkshopOrFollowUp = () => {
        return faker.random.arrayElement(progressionsWorkshopOrFollowUp)
    }
    const logInRandomUser = (progression: Progression = getRandomProgressionWorkshopOrFollowUp()) => {
        const user = faker.random.arrayElement(users)
        cy.visitEvaluation(seed.evaluationId, user, fusionProject1.id)
        evaluationPage.progressionStepLink(progression).click()
        return user
    }

    beforeEach(() => {
        seed = createSeedWithActions(users, roles, { completed: false })
        seed.plant()
    })
    describe(`Creating and editing actions`, () => {
        context(`On progressions ${progressionsWorkshopOrFollowUp}`, () => {
            const roles = [
                {
                    role: Role.Facilitator,
                    canCreateAction: true,
                    progression: getRandomProgressionWorkshopOrFollowUp(),
                },
                {
                    role: Role.OrganizationLead,
                    canCreateAction: true,
                    progression: getRandomProgressionWorkshopOrFollowUp(),
                },
                {
                    role: Role.Participant,
                    canCreateAction: true,
                    progression: getRandomProgressionWorkshopOrFollowUp(),
                },
            ]
            roles.forEach(r => {
                it(`${r.role} can ${r.canCreateAction === true ? '' : ' not'} create action on ${r.progression}`, () => {
                    cy.visitProgression(r.progression, seed.evaluationId, seed.findParticipantByRole(r.role).user, fusionProject1.id)
                    let action = createActionTestData(users)
                    r.canCreateAction
                        ? actionsGrid.addActionButton(action.questionOrder).should('be.enabled')
                        : actionsGrid.addActionButton(action.questionOrder).should('not.exist')
                })
            })

            const randomRole = faker.random.arrayElement([Role.Facilitator, Role.Participant, Role.OrganizationLead])
            const randomStageCreateAction = getRandomProgressionWorkshopOrFollowUp()
            const verifyStage = getRandomProgressionWorkshopOrFollowUp()
            it(`Create action by ${randomRole} on ${randomStageCreateAction} 
            then verification that action was created on ${verifyStage}`, () => {
                cy.visitProgression(
                    randomStageCreateAction,
                    seed.evaluationId,
                    seed.findParticipantByRole(randomRole).user,
                    fusionProject1.id
                )
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
                    fusionProject1.id,
                    () => {
                        evaluationPage.progressionStepLink(verifyStage).click()
                        actionsGrid.actionLink(action.questionOrder, action.title).should('exist')
                    }
                )
            })

            let actionNotes: Note[]
            let action: Action
            let updatedAction: Action
            let newNotes: Note[]

            const progressionWhereEdit = getRandomProgressionWorkshopOrFollowUp()
            const progressionWhereVerify = getRandomProgressionWorkshopOrFollowUp()
            it(`Edit action by ${randomRole} on ${progressionWhereEdit} - assign action, add notes 
            then verify notes were added on ${progressionWhereVerify}`, () => {
                let user = seed.findParticipantByRole(randomRole).user
                cy.visitProgression(progressionWhereEdit, seed.evaluationId, user, fusionProject1.id)
                ;({ actionNotes, action } = findActionWithNotes(seed))
                ;({ updatedAction, newNotes } = createEditTestData(seed, user, action))

                actionsGrid.actionLink(action.questionOrder, action.title).click()

                editActionDialog.assertActionValues(action, actionNotes)
                editActionDialog.editAction(updatedAction, newNotes, actionNotes.length)
                editActionDialog.assertNotesValues(actionNotes.concat(newNotes))
                editActionDialog.close()

                cy.testCacheAndDB(() => {
                    evaluationPage.progressionStepLink(progressionWhereVerify).click()
                    actionsGrid.actionLink(action.questionOrder, updatedAction.title).click()
                    editActionDialog.assertActionValues(updatedAction, actionNotes.concat(newNotes))
                }, fusionProject1.id)
            })
        })
        context(`In actions table on follow-up`, () => {
            const rolesThatCanEdit = [Role.Facilitator, Role.Participant, Role.OrganizationLead]
            const randomRole = faker.random.arrayElement(rolesThatCanEdit)
            it(`Edit action by ${randomRole} (from any ${rolesThatCanEdit})`, () => {
                let user = seed.findParticipantByRole(randomRole).user
                cy.visitProgression(Progression.FollowUp, seed.evaluationId, user, fusionProject1.id)
                followUpTabs.actions().click()
                actionTable.table().should('be.visible')
                actionTable.action(seed.actions[0].title).click({ force: true })
                editActionDialog.body().should('be.visible')
            })
        })
    })
    context(`Voiding Actions on progressions ${progressionsWorkshopOrFollowUp}`, () => {
        const voidAction = (actionToVoid: Action) => {
            actionsGrid.voidActionButton(actionToVoid.id).click()
            confirmationDialog.yesButton().click()
        }

        const roles = [
            {
                role: Role.Facilitator,
                canVoidAction: true,
                voidButtonExists: true,
            },
            {
                role: Role.OrganizationLead,
                canVoidAction: false,
                voidButtonExists: false,
            },
            {
                role: Role.Participant,
                canVoidAction: false,
                voidButtonExists: false,
            },
        ]
        roles.forEach(r => {
            it(`${r.role} Cancel button ${r.voidButtonExists === true ? 'exists' : 'does not exist'},  ${
                r.canVoidAction === true ? ' can' : ' can not'
            } void action`, () => {
                cy.visitProgression(
                    getRandomProgressionWorkshopOrFollowUp(),
                    seed.evaluationId,
                    seed.findParticipantByRole(r.role).user,
                    fusionProject1.id
                )
                const { actionToVoid, actionToStay } = getActionToVoidActionToStay()
                if (!r.voidButtonExists) {
                    actionsGrid.voidActionButton(actionToVoid.id).should('not.exist')
                } else {
                    voidAction(actionToVoid)
                    if (r.canVoidAction === false) {
                        cy.contains('are not allowed to perform this operation')
                    } else {
                        cy.testCacheAndDB(() => {
                            evaluationPage.progressionStepLink(getRandomProgressionWorkshopOrFollowUp()).click()
                            cy.contains(actionToVoid.title).should('have.css', 'textDecorationLine', 'line-through')
                            cy.contains(actionToStay.title).should('not.have.css', 'textDecorationLine', 'line-through')
                        }, fusionProject1.id)
                    }
                }
            })
        })

        const getActionToVoidActionToStay = () => {
            let actions = faker.random.arrayElements(seed.actions, 2)
            let actionToVoid = actions[0]
            let actionToStay = actions[1]
            return { actionToVoid, actionToStay }
        }

        it(`Cancel void action by Facilitator, then verify action was not voided`, () => {
            cy.visitProgression(
                getRandomProgressionWorkshopOrFollowUp(),
                seed.evaluationId,
                seed.findParticipantByRole(Role.Facilitator).user,
                fusionProject1.id
            )
            const { actionToVoid, actionToStay } = getActionToVoidActionToStay()
            actionsGrid.voidActionButton(actionToVoid.id).click()
            confirmationDialog.noButton().click()

            cy.testCacheAndDB(() => {
                evaluationPage.progressionStepLink(getRandomProgressionWorkshopOrFollowUp()).click()
                cy.contains(actionToVoid.title).should('not.have.css', 'textDecorationLine', 'line-through')
                cy.contains(actionToStay.title).should('not.have.css', 'textDecorationLine', 'line-through')
            }, fusionProject1.id)
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
            followUpTabs.actions().click()
            actionTable.table().should('be.visible')
            let actions: Action[] = seed.actions
            actions.forEach(a => {
                const question = seed.questions.find(q => q.id === seed.findQuestionId(a.questionOrder))
                actionTable.assertActionValues(a, question!)
            })
        })
    })
    context('Completing actions', () => {
        let action: Action
        let actionNotes: Note[]
        let updatedAction: Action
        let newNote: Note

        const roleThatCanComplete = faker.random.arrayElement([Role.Facilitator, Role.Participant, Role.OrganizationLead])
        const randomProgression = getRandomProgressionWorkshopOrFollowUp()
        const randomVerifyProgression = getRandomProgressionWorkshopOrFollowUp()
        it(`Complete action by ${roleThatCanComplete} on ${randomProgression} 
            and fill in reason (obligatory)
            then verify action was completed on ${randomVerifyProgression}`, () => {
            let user = seed.findParticipantByRole(roleThatCanComplete).user
            cy.visitProgression(randomProgression, seed.evaluationId, user, fusionProject1.id)
            ;({ actionNotes, action } = findActionWithNotes(seed))
            ;({ updatedAction, newNote } = createCompleteAction(user, action))

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
                evaluationPage.progressionStepLink(randomVerifyProgression).click()
                actionsGrid.actionLink(updatedAction.questionOrder, updatedAction.title).click()
                editActionDialog.assertClosingNoteExists(newNote)
            }, fusionProject1.id)
        })

        it(`Cancel complete action by ${roleThatCanComplete} on ${randomProgression}
            then verify action was not completed`, () => {
            cy.visitProgression(
                randomProgression,
                seed.evaluationId,
                seed.findParticipantByRole(roleThatCanComplete).user,
                fusionProject1.id
            )
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
        fusionProjectId: fusionProject1.id,
    })

    const oneAction = seed.createAction({
        ...actionParameters,
    })

    const existingNotes: Note[] = Array.from({ length: faker.datatype.number({ min: 1, max: 4 }) }, () => {
        return new Note({
            text: faker.lorem.sentence(),
            action: oneAction,
            createdBy: faker.random.arrayElement(seed.participants),
        })
    })

    const moreActions: Action[] = Array.from({ length: faker.datatype.number({ min: 1, max: 2 }) }, () => {
        return seed.createAction(actionParameters)
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

const createCompleteAction = (user: User, existingAction: Action) => {
    const assignableRoles = [Role.Participant, Role.Facilitator, Role.OrganizationLead]
    const updatedAction = { ...existingAction, completed: true }
    const newNote = new Note({
        text: 'Closed because of a good reason',
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
