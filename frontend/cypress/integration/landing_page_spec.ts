import * as faker from "faker"
import { Progression, Role } from "../../src/api/models"
import { Action, Note } from '../support/mocks'
import { EvaluationSeed } from "../support/evaluation_seed"
import { getUsers, User } from "../support/mock/external/users"

describe('Landing page', () => {
    const users = getUsers(4, false)
    const roles = [Role.Facilitator, Role.OrganizationLead, Role.Participant, Role.ReadOnly]
    let evaluationIAmIn: EvaluationSeed
    let evaluationIAmNotIn: EvaluationSeed
    let evaluationNotInProject: EvaluationSeed

    before(() => {
        evaluationIAmIn = createSeedWithActions(users, roles, { completed: false }, '123', 'myEval')
        evaluationIAmNotIn = createSeedWithActions(users.slice(0,2), roles.slice(0,2), { completed: false }, '123', 'notMyEval')
        evaluationNotInProject = createSeedWithActions(users, roles, { completed: false }, '456', 'notProjectEval')
        evaluationIAmIn.plant()
        evaluationIAmNotIn.plant()
        evaluationNotInProject.plant()

        const user = users[2]
        cy.visitProject(user)
    })

    context('Dashboard', () => {
        context('My evaluations', () => {
            it('Verify that evaluationIAmIn is listed under My evaluations', () => {
                const myEvalName = evaluationIAmIn.name
                cy.contains(myEvalName).should('exist')
            })

            it('TODO: Can click evaluationIAmIn', () => {

            })
        
            it('Verify that evaluationIAmNotIn is not listed under My evaluations', () => {
                const notMyEvalName = evaluationIAmNotIn.name
                cy.get(`[data-testid=table]`).within(() => {
                    cy.contains(notMyEvalName).should('not.exist')
                })
            })

            it('Verify that evaluationNotInProject is listed under My evaluations', () => {
                const notProjectEvalName = evaluationNotInProject.name
                cy.contains(notProjectEvalName).should('exist')
            })
        })
        
        context('Navigate', () => {
            it('Navigate to Project evaluations', () => {
                cy.contains('Project evaluations').click()
            })
        })
    
        context('Project evaluations', () => {
            it('Verify that evaluationIAmIn is listed under Project evaluations', () => {
                const myEvalName = evaluationIAmIn.name
                cy.contains(myEvalName).should('exist')
            })
        
            it('Verify that evaluationIAmNotIn is listed under Project evaluations', () => {
                const notMyEvalName = evaluationIAmNotIn.name
                cy.contains(notMyEvalName).should('exist')
            })

            it('TODO: Can click evaluationIAmNotIn', () => {

            })
        
            it('Verify that evaluationNotInProject is not displayed', () => {
                const notProjectEvalName = evaluationNotInProject.name
                cy.get(`[data-testid=table]`).within(() => {
                    cy.contains(notProjectEvalName).should('not.exist')
                })
            })
        })
    })
    
    context('TODO: Actions', () => {

    })

})

const createSeedWithActions = (users: User[], roles: Role[], actionParameters: Partial<Action>, fusionProjectId: string, namePrefix: string) => {
    const seed = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users,
        roles,
        fusionProjectId,
        namePrefix,
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
