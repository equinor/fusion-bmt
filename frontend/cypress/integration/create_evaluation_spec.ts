import { Role } from '../../src/api/models'
import { EvaluationSeed } from '../support/evaluation_seed'
import { evaluationName } from '../support/helpers'
import NominationPage from '../support/nomination'
import ProjectPage from '../support/project'
import users, { User } from '../support/users'

const evaluationUserIsFacilitator = () => {
    let seed = new EvaluationSeed({
        nParticipants: 3,
        namePrefix: 'user is Facilitator',
    })
    let user = seed.participants[2]
    user.role = Role.Facilitator
    return seed
}

const evaluationUserIsParticipant = () => {
    return new EvaluationSeed({
        nParticipants: 3,
        namePrefix: 'user is Participant',
    })
}

const evaluationUserIsNotInIt = () => {
    return new EvaluationSeed({
        nParticipants: 2,
        namePrefix: 'user is not part of this Evaluation',
    })
}

describe('Creating a new Evaluation', () => {
    const user: User = users[2]
    let userIsFacilitator = { seed: evaluationUserIsFacilitator(), name: 'user is Facilitator' }
    let userIsParticipant = { seed: evaluationUserIsParticipant(), name: 'user is Participant' }
    let userIsNotInEvaluation = { seed: evaluationUserIsNotInIt(), name: 'user is not in evaluation' }
    let previousEvaluations = [userIsFacilitator, userIsParticipant, userIsNotInEvaluation]

    before(() => {
        userIsFacilitator.seed.plant()
        userIsParticipant.seed.plant()
        userIsNotInEvaluation.seed.plant()
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
        nominationPage.assertParticipantAdded(user)
    })

    context('Can create evaluation ', () => {
        previousEvaluations.forEach(previous => {
            it(`Choosing a previous evaluation where ${previous.name}`, () => {
                const name = evaluationName({ prefix: 'CreatedWithPrevLink' })

                const projectPage = new ProjectPage()
                projectPage.createEvaluationButton().click()

                const dialog = new ProjectPage.CreateEvaluationDialog()
                dialog.createEvaluation(name, previous.seed.name)

                const nominationPage = new NominationPage()
                nominationPage.evaluationTitle().should('have.text', name)
                nominationPage.assertParticipantAdded(user)
            })
        })
    })
})
