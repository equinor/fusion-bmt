import { Progression, Role } from '../../src/api/models'
import { EvaluationSeed } from '../support/testsetup/evaluation_seed'
import { getUsers, User } from '../support/mock/external/users'
import { fusionProject1 } from '../support/mock/external/projects'
import { Answer } from '../support/testsetup/mocks'

describe('Viewing answers on stage PREPARATION', () => {
    const users = getUsers(4)
    const roles = [Role.Facilitator, Role.OrganizationLead, Role.Participant, Role.Participant]
    const evalWithIndividualAnswers = new EvaluationSeed({
        progression: Progression.Preparation,
        users,
        roles,
        fusionProjectId: fusionProject1.id,
        namePrefix: 'someAnswers',
    })
    const firstParticipant = evalWithIndividualAnswers.participants.filter(p => p.role === Role.Participant)[0]
    const secondParticipant = evalWithIndividualAnswers.participants.filter(p => p.role === Role.Participant)[1]
    const lead = evalWithIndividualAnswers.participants.find(p => p.role === Role.OrganizationLead)!
    const facilitator = evalWithIndividualAnswers.participants.find(p => p.role === Role.Facilitator)!
    const questionOrder = 1
    const firstParticipantAnswerText = 'First Answer by first participant'
    const secondParticipantAnswerText = 'Second Answer by second participant'
    const facilitatorAnswerText = 'Facilitator answer text'
    const leadAnswerText = 'Lead answer text'
    evalWithIndividualAnswers
        .addAnswer(
            new Answer({
                questionOrder: questionOrder,
                answeredBy: firstParticipant,
                progression: Progression.Individual,
                text: firstParticipantAnswerText,
            })
        )
        .addAnswer(
            new Answer({
                questionOrder: questionOrder,
                answeredBy: secondParticipant,
                progression: Progression.Individual,
                text: secondParticipantAnswerText,
            })
        )
        .addAnswer(
            new Answer({
                questionOrder: questionOrder,
                answeredBy: facilitator,
                progression: Progression.Individual,
                text: facilitatorAnswerText,
            })
        )
        .addAnswer(
            new Answer({
                questionOrder: questionOrder,
                answeredBy: lead,
                progression: Progression.Individual,
                text: leadAnswerText,
            })
        )
    before('Load evaluation with answers by two participants', () => {
        evalWithIndividualAnswers.plant()
    })
    it('Participant can only see his/her own answer', () => {
        cy.visitProgression(Progression.Preparation, evalWithIndividualAnswers.evaluationId, firstParticipant.user, fusionProject1.id)
        cy.getByDataTestid('view-answers-' + questionOrder).within(() => {
            cy.getByDataTestid('view-answers').click()
        })
        cy.contains(firstParticipantAnswerText).should('be.visible')
        cy.contains(secondParticipantAnswerText).should('not.exist')
        cy.contains(facilitatorAnswerText).should('not.exist')
        cy.contains(leadAnswerText).should('not.exist')
    })

    const LeadFacilitarorRoles = [Role.Facilitator, Role.OrganizationLead]
    LeadFacilitarorRoles.forEach(role => {
        it(`${role} can see answers regardless of role`, () => {
            const daUser = evalWithIndividualAnswers.participants.find(p => p.role === role)!.user
            cy.visitProgression(
                Progression.Preparation,
                evalWithIndividualAnswers.evaluationId,
                evalWithIndividualAnswers.participants.find(p => p.role === role)!.user,
                fusionProject1.id
            )
            cy.getByDataTestid('view-answers-' + questionOrder).within(() => {
                cy.getByDataTestid('view-answers').click()
            })
            cy.contains(firstParticipantAnswerText).should('be.visible')
            cy.contains(secondParticipantAnswerText).should('be.visible')
            cy.contains(facilitatorAnswerText).should('be.visible')
            cy.contains(leadAnswerText).should('be.visible')
        })
    })
})
