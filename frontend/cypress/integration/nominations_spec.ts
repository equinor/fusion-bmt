import { EvaluationSeed } from '../support/evaluation_seed'
import { Progression, Role } from '../../src/api/models'
import { Participant } from '../support/mocks'
import NominationPage from '../support/nomination'
import { getUsers } from '../support/mock/external/users'

describe('Nomination', () => {
    context('Delete', () => {
        let seed: EvaluationSeed
        let facilitator: Participant
        let otherFacilitator: Participant

        beforeEach(() => {
            ;({ seed, facilitator, otherFacilitator } = createDeleteSeed())
            seed.plant()
        })

        function visitEvaluation(visitAs: Participant) {
            cy.visitEvaluation(seed.evaluationId, visitAs.user)
            cy.contains(facilitator.user.name).should('exist')
            cy.contains(otherFacilitator.user.name).should('exist')
        }

        function checkDelete(notPossibleToDelete: Participant, possibleToDelete: Participant) {
            const nominationPage = new NominationPage()
            nominationPage.deletePersonDiv(notPossibleToDelete.user).should('not.exist')
            nominationPage.deletePerson(possibleToDelete.user)

            cy.testCacheAndDB(() => {
                nominationPage.assertParticipantAbsent(possibleToDelete.user)
            })
        }

        it('Facilitator can delete an other facilitator, but not themself', () => {
            visitEvaluation(facilitator)
            checkDelete(facilitator, otherFacilitator)
        })

        it('Other facilitator who is not owner can delete owner', () => {
            visitEvaluation(otherFacilitator)
            checkDelete(otherFacilitator, facilitator)
            cy.visitProject(facilitator.user)
            cy.contains(seed.name).should('not.exist')
        })
    })
})

const createDeleteSeed = () => {
    let users = getUsers(2)
    const seed = new EvaluationSeed({
        progression: Progression.Nomination,
        users: users,
    })
    seed.participants[1].role = Role.Facilitator
    const facilitator = seed.participants[0]
    const otherFacilitator = seed.participants[1]
    return { seed, facilitator, otherFacilitator }
}
