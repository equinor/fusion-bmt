import * as faker from 'faker'
import { Progression, Role } from '../../src/api/models'

import { EvaluationSeed } from '../support/evaluation_seed'
import { getUsers } from '../support/mock/external/users'
import { EvaluationPage } from '../support/evaluation'
import { fusionProject1, fusionProject4 } from '../support/mock/external/projects'

describe(`Landing page
        Initiate system with projects ${fusionProject1.name} (id=${fusionProject1.id}) & ${fusionProject4.name} (id=${fusionProject4.id})
        User enters ${fusionProject1.name} (id=${fusionProject1.id})`, () => {
    const users = getUsers(4)
    const roles = [Role.Facilitator, Role.OrganizationLead, Role.Participant, Role.ReadOnly]
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
        cy.visitProject(user)
    })

    context(`Dashboard `, () => {
        context('My evaluations', () => {
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
                it(`Evaluation of project (id=${t.eval.fusionProjectId}) that user ${
                    t.isListed ? 'participates in ' : 'does not participate in '
                } is ${t.isListed ? '' : 'not'} listed under My evaluations`, () => {
                    const evalName = t.eval.name
                    cy.get(`[data-testid=project-table]`).within(() => {
                        t.isListed ? cy.contains(evalName).should('exist') : cy.contains(evalName).should('not.exist')
                    })
                })
            })

            it('User can open own evaluation', () => {
                const myEvalName = evaluationIAmIn.name
                cy.contains(myEvalName).click()
                const evaluationPage = new EvaluationPage()
                evaluationPage.progressionStepLink(evaluationIAmIn.progression).should('be.visible')
            })
        })

        context('Project evaluations', () => {
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
                it(`Evaluation of project (id=${t.eval.fusionProjectId}) the user is ${t.userIsIn ? '' : 'not '} in is ${
                    t.isListed ? '' : 'not'
                } listed under Project evaluations`, () => {
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
    })

    context('Actions', () => {
        context('Action table', () => {
            it('Action assigned to user is listed', () => {
                cy.get('button').contains('Actions').click()
                cy.get(`[data-testid=action-table]`).within(() => {
                    cy.contains(evaluationIAmIn.actions.find(a => a.assignedTo.user === user)!.title).should('exist')
                })
            })
            it('Action not assigned to user is not listed', () => {
                cy.get('button').contains('Actions').click()
                cy.get(`[data-testid=action-table]`).within(() => {
                    cy.contains(evaluationIAmIn.actions.find(a => a.assignedTo.user !== user)!.title).should('not.exist')
                })
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
