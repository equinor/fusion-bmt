import { EvaluationSeed } from '../support/testsetup/evaluation_seed'
import { Progression, Role } from '../../src/api/models'
import { WorkshopAssessmentTabs, WorkshopSummary } from '../page_objects/workshop_assessment'
import { getUsers } from '../support/mock/external/users'
import { MarkdownEditor, SaveIndicator } from '../page_objects/common'
import { EvaluationPage } from '../page_objects/evaluation'
import { SavingState } from '../../src/utils/Variables'
import { fusionProject1 } from '../support/mock/external/projects'

describe('Workshop assessment', () => {
    let seed: EvaluationSeed
    const workshopAssessmentTabs = new WorkshopAssessmentTabs()
    const workshopSummary = new WorkshopSummary()
    const originalSummaryMessage = 'Chocolate for you!'
    const editedSummaryMessage = 'Tulips for you! 🌷🌷🌷'
    const progression = Progression.Workshop
    const evaluationPage = new EvaluationPage()
    const markdownEditor = new MarkdownEditor()

    context('Workshop Summary', () => {
        beforeEach(() => {
            seed = new EvaluationSeed({
                progression,
                users: getUsers(4),
                roles: [Role.Facilitator, Role.OrganizationLead, Role.Participant, Role.ReadOnly],
                fusionProjectId: fusionProject1.id,
            })
            seed.addSummary({ summary: originalSummaryMessage, createdBy: seed.findParticipantByRole(Role.Facilitator) })
            seed.plant()
        })

        it('FACILITATOR can edit and save notes', () => {
            cy.visitProgression(progression, seed.evaluationId, seed.findParticipantByRole(Role.Facilitator).user, fusionProject1.id)
            workshopAssessmentTabs.workshopSummary().click()
            markdownEditor.assertContent(originalSummaryMessage)
            workshopSummary.assertEditorDisabler('hidden')
            workshopSummary.body().within(() => {
                markdownEditor.setContent(editedSummaryMessage)
            })
            new SaveIndicator().assertState(SavingState.Saved)

            cy.testCacheAndDB(() => {
                evaluationPage.progressionStepLink(progression).click()
                workshopAssessmentTabs.workshopSummary().click()
                markdownEditor.assertContent(editedSummaryMessage)
            }, fusionProject1.id)
        })

        const roles = [Role.OrganizationLead, Role.Participant, Role.ReadOnly]

        roles.forEach(role => {
            it(`${role} can see Workshop Summary notes but not edit it`, () => {
                cy.visitProgression(progression, seed.evaluationId, seed.findParticipantByRole(role).user, fusionProject1.id)
                workshopAssessmentTabs.workshopSummary().click()
                markdownEditor.assertContent(originalSummaryMessage)
                workshopSummary.assertEditorDisabler('visible')
            })
        })
    })
})
