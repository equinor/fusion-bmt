import * as faker from 'faker'
import { Progression, Role } from '../../src/api/models'
import { EvaluationSeed } from '../support/testsetup/evaluation_seed'
import { getUsers } from '../support/mock/external/users'
import { EvaluationPage } from '../page_objects/evaluation'
import { fusionProject1, fusionProject4 } from '../support/mock/external/projects'
import { ActionTable } from '../page_objects/action-table'
import { EditActionDialog } from '../page_objects/action'

describe('Landing page', () => {
    const users = getUsers(3)
    const roles = [Role.Facilitator, Role.OrganizationLead, Role.Participant]
    const user = users[2]

    const evaluationIAmIn = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users,
        roles,
        fusionProjectId: fusionProject1.id,
        namePrefix: 'myEval',
    })
    evaluationIAmIn
        .addAction(
            evaluationIAmIn.createAction({
                completed: false,
                assignedTo: evaluationIAmIn.participants.find(p => p.user === user),
                title: 'My action' + faker.lorem.words(),
                description: 'My action' + faker.lorem.words(),
            })
        )
        .addAction(
            evaluationIAmIn.createAction({
                completed: false,
                assignedTo: evaluationIAmIn.participants.find(p => p.user !== user),
                title: 'Not my action' + faker.lorem.words(),
                description: 'Not my action' + faker.lorem.words(),
            })
        )
        .addAction(
            evaluationIAmIn.createAction({
                isVoided: true,
                completed: false,
                assignedTo: evaluationIAmIn.participants.find(p => p.user === user),
                title: 'My voided action' + faker.lorem.words(),
                description: 'My voided action' + faker.lorem.words(),
            })
        )
        .addAction(
            evaluationIAmIn.createAction({
                isVoided: false,
                completed: true,
                assignedTo: evaluationIAmIn.participants.find(p => p.user === user),
                title: 'My completed action' + faker.lorem.words(),
                description: 'My completed action' + faker.lorem.words(),
            })
        )

    const evaluationIAmNotIn = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users: users.slice(0, 2),
        roles: roles.slice(0, 2),
        fusionProjectId: fusionProject1.id,
        namePrefix: 'notMyEval',
    })
    const evaluationNotInProject = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users: users,
        roles: roles,
        fusionProjectId: fusionProject4.id,
        namePrefix: 'notProjectEval',
    })

    before(() => {
        evaluationIAmIn.plant()
        evaluationIAmNotIn.plant()
        evaluationNotInProject.plant()
    })

    beforeEach(() => {
        cy.visitProject(user, fusionProject1.id)
    })

    context(`Dashboard `, () => {
        context('My evaluations (only my evaluations are listed)', () => {
            const testdata = [
                {
                    eval: evaluationIAmIn,
                    isListed: true,
                },
                {
                    eval: evaluationIAmNotIn,
                    isListed: false,
                },
                {
                    eval: evaluationNotInProject,
                    isListed: true,
                },
            ]

            testdata.forEach(t => {
                it(`Evaluation of ${t.eval.fusionProjectId === evaluationIAmIn.fusionProjectId ? 'selected' : ' different'} project (id=${
                    t.eval.fusionProjectId
                }) that user ${t.isListed ? 'participates in ' : 'does not participate in '} is ${
                    t.isListed ? '' : 'not'
                } listed under My evaluations`, () => {
                    const evalName = t.eval.name
                    cy.get(`[data-testid=project-table]`).within(() => {
                        t.isListed ? cy.contains(evalName).should('exist') : cy.contains(evalName).should('not.exist')
                    })
                })
            })

            it('User can open own evaluation of selected project', () => {
                const myEvalName = evaluationIAmIn.name
                cy.contains(myEvalName).click()
                const evaluationPage = new EvaluationPage()
                evaluationPage.progressionStepLink(evaluationIAmIn.progression).should('be.visible')
            })
        })
    })

    context('Project evaluations (only evaluation of selected project are listed)', () => {
        const testdata = [
            {
                eval: evaluationIAmIn,
                userIsIn: true,
                isListed: true,
            },
            {
                eval: evaluationIAmNotIn,
                userIsIn: false,
                isListed: true,
            },
            {
                eval: evaluationNotInProject,
                userIsIn: true,
                isListed: false,
            },
        ]

        testdata.forEach(t => {
            it(`Evaluation of ${
                t.eval.fusionProjectId === evaluationIAmIn.fusionProjectId ? 'selected' : ' different'
            } project the user is ${t.userIsIn ? '' : 'not '} in is ${t.isListed ? '' : 'not'} listed under Project evaluations`, () => {
                cy.contains('Project evaluations').click()
                const evalName = t.eval.name
                cy.get(`[data-testid=project-table]`).within(() => {
                    t.isListed ? cy.contains(evalName).should('exist') : cy.contains(evalName).should('not.exist')
                })
            })
        })

        it('User can open evaluation user is not part of', () => {
            cy.contains('Project evaluations').click()
            const notMyEvalName = evaluationIAmNotIn.name
            cy.contains(notMyEvalName).click()
            const evaluationPage = new EvaluationPage()
            evaluationPage.progressionStepLink(evaluationIAmNotIn.progression).should('be.visible')
        })
    })

    context('Actions', () => {
        context('Action table', () => {
            const actionTable = new ActionTable()
            it(`Action assigned to user is listed
            voided/cancelled actions assigned to user are not listed`, () => {
                cy.get('button').contains('Actions').click()
                actionTable.table().within(() => {
                    cy.contains(evaluationIAmIn.actions.find(a => a.assignedTo.user === user)!.title).should('exist')
                })
                actionTable.table().within(() => {
                    cy.contains(evaluationIAmIn.actions.find(a => a.assignedTo.user === user && a.isVoided === true)!.title).should(
                        'not.exist'
                    )
                })
            })
            it('Action not assigned to user is not listed', () => {
                cy.get('button').contains('Actions').click()
                actionTable.table().within(() => {
                    cy.contains(evaluationIAmIn.actions.find(a => a.assignedTo.user !== user)!.title).should('not.exist')
                })
            })
            it('Verify user can edit his own actions', () => {
                cy.get('button').contains('Actions').click()
                const editActionDialog = new EditActionDialog()
                actionTable.table().should('be.visible')
                actionTable.action(evaluationIAmIn.actions[0].title).click({ force: true })
                editActionDialog.body().should('be.visible')
            })
        })
    })

    context('Page navigation', () => {
        it('User can navigate to Actions tab from Dashboard', () => {
            cy.get('button').contains('Actions').click()
            cy.get(`[data-testid=action-table]`).should('be.visible')
        })
        it('User can navigate to Project evaluations from My evaluations', () => {
            cy.contains('Project evaluations').click()
            cy.get(`[data-testid=project-table]`).should('exist')
            const notMyEvalName = evaluationIAmNotIn.name
            cy.contains(notMyEvalName).should('exist')
        })
    })
})
