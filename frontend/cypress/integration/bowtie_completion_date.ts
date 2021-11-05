import { EvaluationSeed } from '../support/testsetup/evaluation_seed'
import { Progression, Role } from '../../src/api/models'
import FollowUpTabs from '../page_objects/followup'
import { EvaluationPage } from '../page_objects/evaluation'
import { getUsers } from '../support/mock/external/users'
import * as faker from 'faker'
import { fusionProject1 } from '../support/mock/external/projects'

describe('Workshop Summary', () => {
    let seed: EvaluationSeed
    const evaluationPage = new EvaluationPage()
    const followUpTabs = new FollowUpTabs()

    context('Bowtie model', () => {
        it('User can not see complete date on an incomplete Evaluation', () => {
            const progression = faker.random.arrayElement(Object.values(Progression).filter(p => p !== Progression.FollowUp && p!== Progression.Finished))
            const roles = [Role.Facilitator, Role.Participant]
            seed = new EvaluationSeed({
                progression,
                users: getUsers(2),
                roles,
                fusionProjectId: fusionProject1.id,
            })

            seed.plant().then(() => {
                const user = faker.random.arrayElement(seed.participants).user

                cy.visitEvaluation(seed.evaluationId, user, fusionProject1.id)
                evaluationPage.progressionStepLink(Progression.FollowUp).click()
                followUpTabs.workshopSummary().click()

                cy.contains('Workshop completed:').should('not.exist')
            })
        })

        it('User can see complete date on a complete Evaluation', () => {
            const today = new Date().toLocaleDateString()
            const roles = [Role.Facilitator, Role.Participant]
            seed = new EvaluationSeed({
                progression: Progression.FollowUp,
                users: getUsers(2),
                roles,
                fusionProjectId: fusionProject1.id,
            })

            seed.plant().then(() => {
                const user = faker.random.arrayElement(seed.participants).user

                cy.visitEvaluation(seed.evaluationId, user, fusionProject1.id)
                followUpTabs.workshopSummary().click()

                cy.contains(`Workshop completed: ${today}`).should('be.visible')
            })
        })
    })
})
