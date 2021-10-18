import { Progression, Role } from '../../src/api/models'
import { EvaluationSeed, evaluation, activeQuestionTemplates } from '../support/testsetup/evaluation_seed'
import { evaluationName } from '../support/helpers/helpers'
import NominationPage from '../page_objects/nomination'
import ProjectPage from '../page_objects/project'
import { getUsers, users, User } from '../support/mock/external/users'
import * as faker from 'faker'
import { Barrier, EvaluationPage } from '../page_objects/evaluation'
import { ConfirmationDialog } from '../page_objects/common'
import { fusionProject1 } from '../support/mock/external/projects'

describe('Evaluation management', () => {
    const createEvaluation = (creator: User, otherUser: User, roles: Role[], prefix: string) => {
        let seed = new EvaluationSeed({
            progression: faker.random.arrayElement(Object.values(Progression)),
            users: [creator, otherUser],
            roles,
            namePrefix: prefix,
        })
        return seed
    }

    context('Creating a new Evaluation', () => {
        const user = users[2]
        const roles = [Role.Facilitator, Role.Participant]
        const previousEvaluation = createEvaluation(user, users[0], roles, 'previous evaluation')

        before(() => {
            previousEvaluation.plant()
        })

        beforeEach(() => {
            cy.visitProject(user)
        })

        const testdata = [
            { withPreviousEvaluation: false, projectCategory: 'SquareField' },
            { withPreviousEvaluation: true, projectCategory: 'CircleField' },
        ]

        testdata.forEach(t => {
            it(`Create evaluation ${t.withPreviousEvaluation ? 'with' : 'without'} previous evaluation, 
            and verify only questions in selected project category ${t.projectCategory} are present
            and verify questions are numbered sequentially globally across the barriers`, () => {
                const name = evaluationName({ prefix: 'evaluation' })

                const projectPage = new ProjectPage()
                projectPage.createEvaluationButton().click()

                const dialog = new ProjectPage.CreateEvaluationDialog()
                t.withPreviousEvaluation
                    ? dialog.createEvaluation(name, t.projectCategory, previousEvaluation.name)
                    : dialog.createEvaluation(name, t.projectCategory)

                const nominationPage = new NominationPage()
                nominationPage.evaluationTitle().should('have.text', name)

                evaluation(name).then(currentEvaluation => {
                    activeQuestionTemplates(t.projectCategory).then(expectedTemplates => {
                        expect(currentEvaluation.questions.length, 'not all active question templates added to evaluation').to.equal(
                            expectedTemplates.length
                        )
                    })
                    cy.visitProgression(Progression.Individual, currentEvaluation.id, user, fusionProject1.id)
                    cy.contains('Questionaire')
                    const evaluationPage = new EvaluationPage()
                    let questionCounter = 1
                    let totalQuestionCounter = 0
                    Object.values(Barrier).forEach(element => {
                        evaluationPage.goToBarrier(element)
                        evaluationPage.barrierQuestionCount(element).then(e => {
                            const q = parseInt(Cypress.$(e).text().split('/')[1])
                            totalQuestionCounter += q
                            if (q !== 0) {
                                cy.get(evaluationPage.questionNoSelector).each(q => {
                                    expect(parseInt(q.text().replace('.', '')), ' question number is in a sequence').to.equal(
                                        questionCounter
                                    )
                                    questionCounter++
                                })
                            }
                            if (element === Object.values(Barrier).slice(-1)[0]) {
                                expect(totalQuestionCounter, 'All active question templates were added').eq(
                                    currentEvaluation.questions.length
                                )
                            }
                        })
                    })
                })
            })
        })
    })

    context('Progressing an Evaluation', () => {
        let seed: EvaluationSeed
        const evaluationPage = new EvaluationPage()
        const nominationPage = new NominationPage()
        const confirmationDialog = new ConfirmationDialog()

        beforeEach(() => {
            seed = new EvaluationSeed({
                progression: Progression.Nomination,
                users: getUsers(1),
                roles: [Role.Facilitator],
            })
            seed.plant()
        })

        it('FACILITATOR can progress from nomination', () => {
            cy.visitEvaluation(seed.evaluationId, seed.participants[0].user)

            nominationPage.finishNominationButton().click()
            confirmationDialog.yesButton().click()

            evaluationPage.progressionStepLink(seed.progression, 'Complete').should('be.visible')
        })
    })
})
