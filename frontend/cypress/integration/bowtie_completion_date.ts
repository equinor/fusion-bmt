import { EvaluationSeed } from '../support/evaluation_seed'
import { Progression } from '../../src/api/models'
import FollowUpTabs from '../support/followup'
import { EvaluationPage } from '../support/evaluation'
import { getUsers } from '../support/mock/external/users'
import * as faker from 'faker'

describe('Workshop Summary', () => {
    let seed: EvaluationSeed
    const evaluationPage = new EvaluationPage()
    const followUpTabs = new FollowUpTabs()

    context('Bowtie model', () => {
        it('User can not see complete date on an incomplete Evaluation', () => {
            const progression = faker.random.arrayElement(Object.values(Progression).filter(p => p !== Progression.FollowUp))

            seed = new EvaluationSeed({
                progression,
                users: getUsers(2),
            })

            seed.plant().then(() => {
                const user = faker.random.arrayElement(seed.participants).user

                cy.visitEvaluation(seed.evaluationId, user)
                evaluationPage.progressionStepLink(Progression.FollowUp).click()
                followUpTabs.workshopSummary().click()

                cy.contains('Workshop completed:').should('not.exist')
            })
        })

        it('User can see complete date on a complete Evaluation', () => {
            const today = new Date().toLocaleDateString()

            seed = new EvaluationSeed({
                progression: Progression.FollowUp,
                users: getUsers(2),
            })

            seed.plant().then(() => {
                const user = faker.random.arrayElement(seed.participants).user

                cy.visitEvaluation(seed.evaluationId, user)
                followUpTabs.workshopSummary().click()

                cy.contains(`Workshop completed: ${today}`).should('be.visible')
            })
        })
    })
})
