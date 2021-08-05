import { EvaluationSeed } from '../support/evaluation_seed'
import { Progression, Role } from '../../src/api/models'
import { Participant } from '../support/mocks'
import NominationPage from '../support/nomination'
import users from '../support/users'

describe('Nomination', () => {
    context('Delete', () => {
        let seed: EvaluationSeed
        let owner: Participant
        let otherFacilitator: Participant

        beforeEach(() => {
            ;({ seed, owner, otherFacilitator } = createDeleteSeed())

            seed.plant()
        })

        it('Facilitator can delete an other facilitator, but not themself', () => {
            cy.visitEvaluation(seed.evaluationId, owner.user)
            cy.contains(owner.user.name).should('exist')
            cy.contains(otherFacilitator.user.name).should('exist')

            const nominationPage = new NominationPage()
            nominationPage.deletePersonDiv(owner.user).should('not.exist')
            nominationPage.deletePerson(otherFacilitator.user)
            cy.testCacheAndDB(() => {
                nominationPage.assertParticipantNotThere(otherFacilitator.user)
            })
        })

        it('Other facilitator who is not owner can delete owner', () => {
            cy.visitEvaluation(seed.evaluationId, otherFacilitator.user)
            cy.contains(owner.user.name).should('exist')
            cy.contains(otherFacilitator.user.name).should('exist')

            const nominationPage = new NominationPage()
            nominationPage.deletePersonDiv(otherFacilitator.user).should('not.exist')
            nominationPage.deletePerson(owner.user)
            cy.testCacheAndDB(() => {
                nominationPage.assertParticipantNotThere(owner.user)
            })
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
