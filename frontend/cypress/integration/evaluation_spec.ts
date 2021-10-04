import { Progression, Role } from '../../src/api/models'
import { EvaluationSeed, evaluation, activeQuestionTemplates } from '../support/evaluation_seed'
import { evaluationName } from '../support/helpers'
import NominationPage from '../page_objects/nomination'
import ProjectPage from '../page_objects/project'
import { getUsers, users, User } from '../support/mock/external/users'
import * as faker from 'faker'
import { EvaluationPage } from '../page_objects/evaluation'
import { ConfirmationDialog } from '../page_objects/common'

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
            it(`Create evaluation ${
                t.withPreviousEvaluation ? 'with' : 'without'
            } previous evaluation, verify only questions in selected project category ${t.projectCategory} are present`, () => {
                const name = evaluationName({ prefix: 'evaluation' })

                const projectPage = new ProjectPage()
                projectPage.createEvaluationButton().click()

                const dialog = new ProjectPage.CreateEvaluationDialog()
                t.withPreviousEvaluation
                    ? dialog.createEvaluation(name, t.projectCategory, previousEvaluation.name)
                    : dialog.createEvaluation(name, t.projectCategory)

                const nominationPage = new NominationPage()
                nominationPage.evaluationTitle().should('have.text', name)

                //const query = new EvaluationQuery()
                evaluation(name).then(currentEvaluation => {
                    activeQuestionTemplates(t.projectCategory).then(expectedTemplates => {
                        expect(currentEvaluation.questions.length, 'not all active question templates added to evaluation').to.equal(
                            expectedTemplates.length
                        )
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
