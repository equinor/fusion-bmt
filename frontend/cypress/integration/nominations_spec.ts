import { EvaluationSeed } from '../support/evaluation_seed'
import { Progression, Role } from '../../src/api/models'
import { Participant } from '../support/mocks'
import NominationPage from '../support/nomination'

describe('Nomination', () => {
    context('Delete', () => {
        let seed: EvaluationSeed
        let owner: Participant
        let otherFacilitator: Participant

        beforeEach(() => {
            ;({ seed, owner, otherFacilitator } = createDeleteSeed())

            seed.plant()
        })

        function visitEvaluation(visitAs: Participant) {
            cy.visitEvaluation(seed.evaluationId, visitAs.user)
            cy.contains(owner.user.name).should('exist')
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
            visitEvaluation(owner)
            checkDelete(owner, otherFacilitator)
        })

        it('Other facilitator who is not owner can delete owner', () => {
            visitEvaluation(otherFacilitator)
            checkDelete(otherFacilitator, owner)
            cy.visitProject(owner.user)
            cy.contains(seed.name).should('not.exist')
        })
    })
})

const createDeleteSeed = () => {
    const seed = new EvaluationSeed({
        progression: Progression.Nomination,
        nParticipants: 2,
    })

    let owner = seed.participants[0]
    owner.role = Role.Facilitator
    let otherFacilitator = seed.participants[1]
    otherFacilitator.role = Role.Facilitator

    return { seed, owner, otherFacilitator }
}
