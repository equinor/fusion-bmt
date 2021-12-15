import { Progression, Role } from '../../src/api/models'
import { EvaluationSeed, evaluation, activeQuestionTemplates, progressEvaluation } from '../support/testsetup/evaluation_seed'
import { evaluationName } from '../support/helpers/helpers'
import NominationPage from '../page_objects/nomination'
import ProjectPage from '../page_objects/project'
import { getUsers, users, User, getUserWithFacilitatorRole, getUserWithAdminRole, getUserWithNoRoles } from '../support/mock/external/users'
import * as faker from 'faker'
import { Barrier, EvaluationPage } from '../page_objects/evaluation'
import { ConfirmationDialog } from '../page_objects/common'
import { fusionProject1 } from '../support/mock/external/projects'
import { PROGRESS_EVALUATION } from '../support/testsetup/gql'

const evaluationPage = new EvaluationPage()
let seed: EvaluationSeed
describe('Evaluation management', () => {
    const createEvaluation = (users: User[], roles: Role[], prefix: string) => {
        let seed = new EvaluationSeed({
            progression: faker.random.arrayElement(Object.values(Progression).filter(p => p !== Progression.Finished)),
            users,
            roles,
            namePrefix: prefix,
            fusionProjectId: fusionProject1.id,
        })
        return seed
    }

    context('Creating a new Evaluation', () => {
        const userFacilitator = getUserWithFacilitatorRole()
        const userNoRoles = getUserWithNoRoles()

        const usersAndAccessITRoles = [userNoRoles, userFacilitator]
        const roles = [Role.Facilitator, Role.Facilitator]
        const previousEvaluation = createEvaluation(usersAndAccessITRoles, roles, 'previous evaluation')

        before(() => {
            previousEvaluation.plant()
        })
        usersAndAccessITRoles.forEach(u => {
            it(`User ${
                u.roles.includes('Role.Facilitator')
                    ? 'with AccessIT role ' + u.roles + ' can'
                    : 'without AccessIT role Role.Facilitator cannot'
            } create an evaluation`, () => {
                cy.visitProject(u, fusionProject1.id)
                const projectPage = new ProjectPage()
                u.roles.includes('Role.Facilitator')
                    ? projectPage.createEvaluationButton().should('exist')
                    : projectPage.createEvaluationButton().should('not.exist')
            })
        })

        const testdata = [
            { withPreviousEvaluation: false, projectCategory: 'SquareField' },
            { withPreviousEvaluation: true, projectCategory: 'CircleField' },
        ]

        testdata.forEach(t => {
            it(`User with AccessIT roles ${userFacilitator.roles} creates evaluation ${
                t.withPreviousEvaluation ? 'with' : 'without'
            } previous evaluation,
            and verify only questions in selected project category ${t.projectCategory} are present
            and verify questions are numbered sequentially globally across the barriers`, () => {
                cy.visitProject(userFacilitator, fusionProject1.id)
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
                    cy.visitProgression(Progression.Individual, currentEvaluation.id, userFacilitator, fusionProject1.id)
                    cy.contains('Questionaire')
                    const evaluationPage = new EvaluationPage()
                    let questionCounter = 0
                    let totalQuestionCounter = 0
                    Object.values(Barrier).forEach(element => {
                        evaluationPage.goToBarrier(element)
                        evaluationPage.barrierQuestionCount(element).then(e => {
                            const q = parseInt(Cypress.$(e).text().split('/')[1])
                            totalQuestionCounter += q
                            if (q !== 0) {
                                cy.get(evaluationPage.questionNoSelector).each(q => {
                                    questionCounter++
                                    expect(parseInt(q.text().replace('.', '')), ' question number is in a sequence').to.equal(
                                        questionCounter
                                    )
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
        const nominationPage = new NominationPage()
        const confirmationDialog = new ConfirmationDialog()

        before(() => {
            seed = new EvaluationSeed({
                progression: Progression.Nomination,
                users: getUsers(1),
                roles: [Role.Facilitator],
                fusionProjectId: fusionProject1.id,
            })
            seed.plant()
        })

        it('FACILITATOR can progress from nomination', () => {
            cy.visitEvaluation(seed.evaluationId, seed.participants[0].user, fusionProject1.id)

            nominationPage.finishNominationButton().click()
            confirmationDialog.yesButton().click()

            evaluationPage.progressionStepLink(seed.progression, 'Complete').should('be.visible')
        })

        it('TODO: When Facilitator progresses evaluation it moves to next stage', () => {
            // To be added
            // Add tests that other than facilitator cannot progress evaluation
        })
    })
    context('Completing/uncompleting a progression', () => {
        beforeEach(() => {
            seed = new EvaluationSeed({
                progression: Progression.Nomination,
                users: getUsers(1),
                roles: [Role.Facilitator],
                fusionProjectId: fusionProject1.id,
            })
            seed.plant()
        })
        const randomProgression = faker.random.arrayElement(
            Object.values(Progression).filter(
                p => p !== Progression.Nomination && p !== Progression.Individual && p !== Progression.Finished
            )
        )
        const progIndex = Object.values(Progression).indexOf(randomProgression)
        const previousProgression = Object.values(Progression)[progIndex - 1]
        it(`Complete cannot be undone on ${previousProgression} when progression has reached ${randomProgression}`, () => {
            progressEvaluation(seed.evaluationId, randomProgression)
            cy.visitProgression(previousProgression, seed.evaluationId, seed.participants[0].user, fusionProject1.id)
            evaluationPage.completeSwitch().should('be.disabled')
        })

        const randomProgressionThatHasCompleteToggle = faker.random.arrayElement(
            Object.values(Progression).filter(p => p !== Progression.Nomination && p !== Progression.FollowUp && p !== Progression.Finished)
        )
        it(`Complete and undo complete on progression ${randomProgressionThatHasCompleteToggle}`, () => {
            progressEvaluation(seed.evaluationId, randomProgressionThatHasCompleteToggle)
            cy.visitProgression(randomProgressionThatHasCompleteToggle, seed.evaluationId, seed.participants[0].user, fusionProject1.id)
            evaluationPage.completeSwitch().should('be.enabled')
            evaluationPage.completeSwitch().check({ force: true })
            expect(evaluationPage.completeSwitch().should('be.checked'))
            evaluationPage.completeSwitch().uncheck({ force: true })
            expect(evaluationPage.completeSwitch().should('not.be.checked'))
        })
    })
})
