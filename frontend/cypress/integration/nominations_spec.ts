import { EvaluationSeed } from '../support/evaluation_seed'
import { Progression, Role } from '../../src/api/models'
import { Participant } from '../support/mocks'
import NominationPage from '../support/nomination'
import { getUsers } from '../support/mock/external/users'

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
    let users = getUsers(2)
    let owner = new Participant({ user: users[0], role: Role.Facilitator, progression: Progression.Nomination })
    let otherFacilitator = new Participant({ user: users[1], role: Role.Facilitator, progression: Progression.Nomination })
    const seed = new EvaluationSeed({
        progression: Progression.Nomination,
        participants: [owner, otherFacilitator],
    })

    return { seed, owner, otherFacilitator }
}
