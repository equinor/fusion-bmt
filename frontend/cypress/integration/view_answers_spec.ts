import { Progression, Role } from '../../src/api/models'
import { EvaluationSeed } from '../support/testsetup/evaluation_seed'
import { getUsers } from '../support/mock/external/users'
import { fusionProject1 } from '../support/mock/external/projects'
import { Answer } from '../support/testsetup/mocks'
import { EvaluationPage } from '../page_objects/evaluation'
import * as faker from 'faker'

describe('Viewing answers', () => {
    const users = getUsers(4)
    const roles = [Role.Facilitator, Role.OrganizationLead, Role.Participant, Role.Participant]
    const evaluationPage = new EvaluationPage()
    const evalWithIndividualAndPreparationAndWorkshopAnswers = new EvaluationSeed({
        progression: faker.random.arrayElement(
            Object.values(Progression).filter(p => p !== Progression.Finished && p !== Progression.Nomination)
        ),
        users,
        roles,
        fusionProjectId: fusionProject1.id,
        namePrefix: 'someAnswers',
    })
    const firstParticipant = evalWithIndividualAndPreparationAndWorkshopAnswers.participants.filter(p => p.role === Role.Participant)[0]
    const secondParticipant = evalWithIndividualAndPreparationAndWorkshopAnswers.participants.filter(p => p.role === Role.Participant)[1]
    const lead = evalWithIndividualAndPreparationAndWorkshopAnswers.participants.find(p => p.role === Role.OrganizationLead)!
    const facilitator = evalWithIndividualAndPreparationAndWorkshopAnswers.participants.find(p => p.role === Role.Facilitator)!
    const questionOrder = 1
    const firstParticipantAnswerText = 'First Answer by first participant'
    const secondParticipantAnswerText = 'Second Answer by second participant'
    const facilitatorAnswerText = 'Facilitator answer text'
    const leadAnswerText = 'Lead answer text'
    const facilitatorPrepAnswerText = 'Facilitator prep answer text'
    const leadPrepAnswerText = 'Lead prep answer text'
    const facilitatorWorkshopAnswerText = 'Facilitator workshop answer text'

    const firstParticipantAnswer = new Answer({
        questionOrder: questionOrder,
        answeredBy: firstParticipant,
        progression: Progression.Individual,
        text: firstParticipantAnswerText,
    })
    const secondParticipantAnswer = new Answer({
        questionOrder: questionOrder,
        answeredBy: secondParticipant,
        progression: Progression.Individual,
        text: secondParticipantAnswerText,
    })
    const facilitatorAnswer = new Answer({
        questionOrder: questionOrder,
        answeredBy: facilitator,
        progression: Progression.Individual,
        text: facilitatorAnswerText,
    })
    const leadAnswer = new Answer({
        questionOrder: questionOrder,
        answeredBy: lead,
        progression: Progression.Individual,
        text: leadAnswerText,
    })
    const facilitatorPrepAnswer = new Answer({
        questionOrder: questionOrder,
        answeredBy: facilitator,
        progression: Progression.Preparation,
        text: facilitatorPrepAnswerText,
    })
    const leadPrepAnswer = new Answer({
        questionOrder: questionOrder,
        answeredBy: lead,
        progression: Progression.Preparation,
        text: leadPrepAnswerText,
    })
    const facilitatorWorkshopAnswer = new Answer({
        questionOrder: questionOrder,
        answeredBy: facilitator,
        progression: Progression.Workshop,
        text: facilitatorWorkshopAnswerText,
    })

    before(
        `Load evaluation with individual answers from all: two participants, one lead and one facilitator
    and preparation answers, one from lead and one from facilitator
    and one workshop answer from facilitator`,
        () => {
            evalWithIndividualAndPreparationAndWorkshopAnswers
                .addAnswer(firstParticipantAnswer)
                .addAnswer(secondParticipantAnswer)
                .addAnswer(facilitatorAnswer)
                .addAnswer(leadAnswer)
                .addAnswer(facilitatorPrepAnswer)
                .addAnswer(leadPrepAnswer)
                .addAnswer(facilitatorWorkshopAnswer)
            evalWithIndividualAndPreparationAndWorkshopAnswers.plant()
        }
    )

    const leadFacilitarorRoles = [Role.Facilitator, Role.OrganizationLead]
    context('Viewing answers on stage PREPARATION', () => {
        it('Participant can only see his/her own individual answer', () => {
            cy.visitProgression(
                Progression.Preparation,
                evalWithIndividualAndPreparationAndWorkshopAnswers.evaluationId,
                firstParticipant.user,
                fusionProject1.id
            )
            evaluationPage.clickViewAnswers(questionOrder)
            cy.contains(firstParticipantAnswerText).should('be.visible')
            cy.contains(secondParticipantAnswerText).should('not.exist')
            cy.contains(facilitatorAnswerText).should('not.exist')
            cy.contains(leadAnswerText).should('not.exist')
        })

        leadFacilitarorRoles.forEach(role => {
            it(`${role} can see all individual answers regardless of role`, () => {
                cy.visitProgression(
                    Progression.Preparation,
                    evalWithIndividualAndPreparationAndWorkshopAnswers.evaluationId,
                    evalWithIndividualAndPreparationAndWorkshopAnswers.participants.find(p => p.role === role)!.user,
                    fusionProject1.id
                )
                evaluationPage.clickViewAnswers(questionOrder)
                cy.contains(firstParticipantAnswerText).should('be.visible')
                cy.contains(secondParticipantAnswerText).should('be.visible')
                cy.contains(facilitatorAnswerText).should('be.visible')
                cy.contains(leadAnswerText).should('be.visible')
            })
        })
    })
    context('Viewing answers on stage Workshop Summary', () => {
        it(`Participant can only see his/her own individual answer 
            and preparation answers from lead and facilitator`, () => {
            cy.visitProgression(
                Progression.Workshop,
                evalWithIndividualAndPreparationAndWorkshopAnswers.evaluationId,
                firstParticipant.user,
                fusionProject1.id
            )
            evaluationPage.clickViewAnswers(questionOrder)
            cy.contains(firstParticipantAnswerText).should('be.visible')
            cy.contains(secondParticipantAnswerText).should('not.exist')
            cy.contains(facilitatorAnswerText).should('not.exist')
            cy.contains(leadAnswerText).should('not.exist')
            cy.contains(facilitatorPrepAnswerText).should('be.visible')
            cy.contains(leadPrepAnswerText).should('be.visible')
        })
        leadFacilitarorRoles.forEach(role => {
            it(`${role} can see all individual and preparation answers`, () => {
                const user = evalWithIndividualAndPreparationAndWorkshopAnswers.participants.find(p => p.role === role)!.user
                cy.visitProgression(
                    Progression.Workshop,
                    evalWithIndividualAndPreparationAndWorkshopAnswers.evaluationId,
                    user,
                    fusionProject1.id
                )
                evaluationPage.clickViewAnswers(questionOrder)
                evaluationPage.verifyAnswerVisible('Individual', firstParticipant.user.name, firstParticipantAnswerText)
                evaluationPage.verifyAnswerVisible('Individual', secondParticipant.user.name, secondParticipantAnswerText)
                evaluationPage.verifyAnswerVisible('Individual', lead.user.name, leadAnswerText)
                evaluationPage.verifyAnswerVisible('Individual', facilitator.user.name, facilitatorAnswerText)
                evaluationPage.verifyAnswerVisible('Preparation', facilitator.user.name, facilitatorPrepAnswerText)
                evaluationPage.verifyAnswerVisible('Preparation', lead.user.name, leadPrepAnswerText)
            })
        })
    })
    context('Viewing answers on stage Follow-up', () => {
        it(`Participant can only see his/her own individual answer 
        and preparation answers from lead and facilitator
        and workshop answer from facilitator`, () => {
            cy.visitProgression(
                Progression.FollowUp,
                evalWithIndividualAndPreparationAndWorkshopAnswers.evaluationId,
                firstParticipant.user,
                fusionProject1.id
            )
            evaluationPage.clickViewAnswers(questionOrder)
            cy.contains(firstParticipantAnswerText).should('be.visible')
            cy.contains(secondParticipantAnswerText).should('not.exist')
            cy.contains(facilitatorAnswerText).should('not.exist')
            cy.contains(leadAnswerText).should('not.exist')
            cy.contains(facilitatorPrepAnswerText).should('be.visible')
            cy.contains(leadPrepAnswerText).should('be.visible')
            cy.contains(facilitatorWorkshopAnswerText).should('be.visible')
        })
        leadFacilitarorRoles.forEach(role => {
            it(`${role} can see all individual, preparation and workshop answers`, () => {
                const user = evalWithIndividualAndPreparationAndWorkshopAnswers.participants.find(p => p.role === role)!.user
                cy.visitProgression(
                    Progression.FollowUp,
                    evalWithIndividualAndPreparationAndWorkshopAnswers.evaluationId,
                    user,
                    fusionProject1.id
                )
                evaluationPage.clickViewAnswers(questionOrder)
                evaluationPage.verifyAnswerVisible('Individual', firstParticipant.user.name, firstParticipantAnswerText)
                evaluationPage.verifyAnswerVisible('Individual', secondParticipant.user.name, secondParticipantAnswerText)
                evaluationPage.verifyAnswerVisible('Individual', lead.user.name, leadAnswerText)
                evaluationPage.verifyAnswerVisible('Individual', facilitator.user.name, facilitatorAnswerText)
                evaluationPage.verifyAnswerVisible('Preparation', facilitator.user.name, facilitatorPrepAnswerText)
                evaluationPage.verifyAnswerVisible('Preparation', lead.user.name, leadPrepAnswerText)
                evaluationPage.verifyAnswerVisible('Workshop', 'Facilitators', facilitatorWorkshopAnswerText)
            })
        })
    })
})
