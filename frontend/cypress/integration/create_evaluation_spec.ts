import { Progression, Role } from '../../src/api/models'
import { EvaluationSeed } from '../support/evaluation_seed'
import { evaluationName } from '../support/helpers'
import NominationPage from '../support/nomination'
import ProjectPage from '../support/project'
import { users, User } from '../support/mock/external/users'
import * as faker from 'faker'

const createEvaluation = (creator: User, otherUser: User, prefix: string) => {
    let seed = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users: [creator, otherUser],
        namePrefix: prefix,
    })
    seed.participants[1].role = Role.Participant
    return seed
}

describe('Creating a new Evaluation', () => {
    const user = users[2]
    const evalUserIsFacilitator = createEvaluation(user, users[0], 'user is Facilitator')
    const evalUserIsParticipant = createEvaluation(users[0], user, 'user is Participant')
    const evalUserIsNotInEvaluation = createEvaluation(users[0], users[1], 'user is not in evaluation')
    const previousEvaluations = [evalUserIsFacilitator, evalUserIsParticipant, evalUserIsNotInEvaluation]

    before(() => {
        evalUserIsFacilitator.plant()
        evalUserIsParticipant.plant()
        evalUserIsNotInEvaluation.plant()
    })

    beforeEach(() => {
        cy.visitProject(user)
    })

    it('Without setting a previous evaluation', () => {
        const name = evaluationName({ prefix: 'CreatedWithoutPrevLink' })

        const projectPage = new ProjectPage()
        projectPage.createEvaluationButton().click()

        const dialog = new ProjectPage.CreateEvaluationDialog()
        dialog.createEvaluation(name)

        const nominationPage = new NominationPage()
        nominationPage.evaluationTitle().should('have.text', name)
    })

    context('Can create evaluation ', () => {
        previousEvaluations.forEach(previous => {
            it(`Choosing a previous evaluation where ${previous.name}`, () => {
                const name = evaluationName({ prefix: 'CreatedWithPrevLink' })

                const projectPage = new ProjectPage()
                projectPage.createEvaluationButton().click()

                const dialog = new ProjectPage.CreateEvaluationDialog()
                dialog.createEvaluation(name, previous.name)

                const nominationPage = new NominationPage()
                nominationPage.evaluationTitle().should('have.text', name)
            })
        })
    })
})
