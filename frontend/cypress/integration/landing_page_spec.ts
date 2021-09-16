import * as faker from 'faker'
import { Progression, Role } from '../../src/api/models'

import { EvaluationSeed } from '../support/evaluation_seed'
import { getUsers, User } from '../support/mock/external/users'
import { EvaluationPage } from '../support/evaluation'

describe('Landing page', () => {
    const users = getUsers(4)
    const roles = [Role.Facilitator, Role.OrganizationLead, Role.Participant, Role.ReadOnly]
    let evaluationIAmIn: EvaluationSeed
    let evaluationIAmNotIn: EvaluationSeed
    let evaluationNotInProject: EvaluationSeed
    const user = users[2]
    before(() => {
        evaluationIAmIn = new EvaluationSeed({
            progression: faker.random.arrayElement(Object.values(Progression)),
            users,
            roles,
            fusionProjectId: '123',
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
        evaluationIAmNotIn = new EvaluationSeed({
            progression: faker.random.arrayElement(Object.values(Progression)),
            users: users.slice(0, 2),
            roles: roles.slice(0, 2),
            fusionProjectId: '123',
            namePrefix: 'notMyEval',
        })
        evaluationNotInProject = new EvaluationSeed({
            progression: faker.random.arrayElement(Object.values(Progression)),
            users: users,
            roles: roles,
            fusionProjectId: '456',
            namePrefix: 'notProjectEval',
        })
        evaluationIAmIn.plant()
        evaluationIAmNotIn.plant()
        evaluationNotInProject.plant()

        cy.visitProject(user)
    })

    context('Dashboard', () => {
        context('My evaluations', () => {
            const testdata = [
                {
                    eval: 'evaluationIAmIn',
                    isListed: true,
                    ofProject: true,
                },
                {
                    eval: 'evaluationIAmNotIn',
                    isListed: false,
                    ofProject: true,
                },
                {
                    eval: 'evaluationNotInProject',
                    isListed: true,
                    ofProject: false,
                },
            ]

            testdata.forEach(t => {
                it(`Verify that evaluation ${t.ofProject ? '' : 'not '} of project that user ${
                    t.isListed ? 'participates in ' : 'does not participate in '
                } is ${t.isListed ? '' : 'not'} listed under My evaluations`, () => {
                    const evalName = eval(t.eval).name
                    cy.get(`[data-testid=table]`).within(() => {
                        t.isListed ? cy.contains(evalName).should('exist') : cy.contains(evalName).should('not.exist')
                    })
                })
            })

            it('Verify that user can view evaluation user does not participate in', () => {
                cy.visitProject(user)
                const myEvalName = evaluationIAmIn.name
                cy.contains(myEvalName).click()
                const evaluationPage = new EvaluationPage()
                evaluationPage.progressionStepLink(evaluationIAmIn.progression).should('be.visible')
                cy.go('back')
            })
        })

        context('Navigate', () => {
            it('Navigate to Project evaluations from My evaluations', () => {
                cy.contains('Project evaluations').click()
                cy.get(`[data-testid=table]`).should('exist')
            })
        })

        context('Project evaluations', () => {
            const testdata = [
                {
                    eval: 'evaluationIAmIn',
                    userIsIn: true,
                    isListed: true,
                },
                {
                    eval: 'evaluationIAmNotIn',
                    userIsIn: false,
                    isListed: true,
                },
                {
                    eval: 'evaluationNotInProject',
                    userIsIn: true,
                    isListed: false,
                },
            ]

            const visitProjectAndGoToProjectEvaluations = () => {
                cy.visitProject(user)
                cy.contains('Project evaluations').click()
                cy.get(`[data-testid=table]`).should('exist')
            }

            testdata.forEach(t => {
                it(`Verify that evaluation ${t.isListed ? '' : 'not '} of project the user is ${t.userIsIn ? '' : 'not '} in is ${
                    t.isListed ? '' : 'not'
                } listed under Project evaluations`, () => {
                    visitProjectAndGoToProjectEvaluations()
                    const evalName = eval(t.eval).name
                    cy.get(`[data-testid=table]`).within(() => {
                        t.isListed ? cy.contains(evalName).should('exist') : cy.contains(evalName).should('not.exist')
                    })
                })
            })

            it('Verify that user can click evaluationIAmNotIn from project evaluations', () => {
                visitProjectAndGoToProjectEvaluations()
                const notMyEvalName = evaluationIAmNotIn.name
                cy.contains(notMyEvalName).click()
                const evaluationPage = new EvaluationPage()
                evaluationPage.progressionStepLink(evaluationIAmNotIn.progression).should('be.visible')
                cy.go('back')
            })
        })
    })

    const visitProjectAndGoToActionsTable = () => {
        cy.visitProject(user)
        cy.get('button').contains('Actions').click()
    }

    context('Actions', () => {
        context('Action table', () => {
            it('Navigate to Actions tab', () => {
                visitProjectAndGoToActionsTable()
                cy.get(`[data-testid=action-table]`).should('be.visible')
            })
            it('Action assigned to me is listed', () => {
                visitProjectAndGoToActionsTable()
                cy.get(`[data-testid=action-table]`).within(() => {
                    cy.contains(evaluationIAmIn.actions.find(a => a.assignedTo.user === user)!.title).should('exist')
                })
            })
            it('Action not assigned to me is not listed', () => {
                visitProjectAndGoToActionsTable()
                cy.get(`[data-testid=action-table]`).within(() => {
                    cy.contains(evaluationIAmIn.actions.find(a => a.assignedTo.user !== user)!.title).should('not.exist')
                })
            })
        })
    })
})
