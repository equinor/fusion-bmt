import { getUsers } from '../support/mock/external/users'
import { Progression, Role } from '../../src/api/models'
import { EvaluationPage } from '../page_objects/evaluation'
import { EvaluationSeed } from '../support/testsetup/evaluation_seed'
import { fusionProject1 } from '../support/mock/external/projects'
import { SaveIndicator } from '../page_objects/common'
import { SavingState } from '../../src/utils/Variables'

import * as faker from 'faker'

describe('Writing answers', () => {
    const users = getUsers(3)
    const roles = [Role.Facilitator, Role.OrganizationLead, Role.Participant]
    const evaluationPage = new EvaluationPage()
    const questionNo = 1
    const evaluationIndividual = new EvaluationSeed({
        progression: Progression.Individual,
        users,
        roles,
        fusionProjectId: fusionProject1.id,
        namePrefix: 'writeAnswersHere',
    })
    const evaluationPreparation = new EvaluationSeed({
        progression: Progression.Preparation,
        users,
        roles,
        fusionProjectId: fusionProject1.id,
        namePrefix: 'writeAnswersHere',
    })
    const evaluationWorkshop = new EvaluationSeed({
        progression: Progression.Workshop,
        users,
        roles,
        fusionProjectId: fusionProject1.id,
        namePrefix: 'writeAnswersHere',
    })
    const evaluations = [evaluationIndividual, evaluationPreparation, evaluationWorkshop]
    before('Initialize system with evaluation', () => {
        evaluations.forEach(e => e.plant())
    })

    const testdata = [
        {
            evaluation: evaluationIndividual,
            roles: [
                { role: Role.Participant, canWriteAnswer: true },
                { role: Role.OrganizationLead, canWriteAnswer: true },
                { role: Role.Facilitator, canWriteAnswer: true },
            ],
        },
        {
            evaluation: evaluationPreparation,
            roles: [
                { role: Role.Participant, canWriteAnswer: false },
                { role: Role.OrganizationLead, canWriteAnswer: true },
                { role: Role.Facilitator, canWriteAnswer: true },
            ],
        },
        {
            evaluation: evaluationWorkshop,
            roles: [
                { role: Role.Participant, canWriteAnswer: false },
                { role: Role.OrganizationLead, canWriteAnswer: false },
                { role: Role.Facilitator, canWriteAnswer: true },
            ],
        },
    ]

    testdata.forEach(progressionRolesCanWrite => {
        progressionRolesCanWrite.roles.forEach(roleCanWrite => {
            it(`On progression ${progressionRolesCanWrite.evaluation.progression} ${roleCanWrite.role} can ${
                roleCanWrite.canWriteAnswer ? '' : ' not '
            } write answer`, () => {
                const participant = progressionRolesCanWrite.evaluation.participants.find(p => p.role === roleCanWrite.role)!
                cy.visitProgression(
                    progressionRolesCanWrite.evaluation.progression,
                    progressionRolesCanWrite.evaluation.evaluationId,
                    participant.user,
                    fusionProject1.id
                )
                if (roleCanWrite.canWriteAnswer === true) {
                    const answerText = 'Answer by ' + roleCanWrite.role
                    evaluationPage.writeAnswer(questionNo, answerText)
                    new SaveIndicator().assertState(SavingState.Saved)
                    evaluationPage.assertAnswerText(questionNo, answerText)
                } else {
                    evaluationPage.assertCannotWriteAnswer(questionNo)
                }
            })
        })
    })
})
