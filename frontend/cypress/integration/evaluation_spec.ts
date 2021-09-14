import { Progression, Role } from '../../src/api/models'
import { EvaluationSeed } from '../support/evaluation_seed'
import { evaluationName } from '../support/helpers'
import NominationPage from '../support/nomination'
import ProjectPage from '../support/project'
import { getUsers, users, User } from '../support/mock/external/users'
import * as faker from 'faker'
import { EvaluationPage } from '../support/evaluation'

describe('Evaluation management', () => {
    const createEvaluation = (creator: User, otherUser: User, prefix: string) => {
        let seed = new EvaluationSeed({
            progression: faker.random.arrayElement(Object.values(Progression)),
            users: [creator, otherUser],
            namePrefix: prefix,
        })
        seed.participants[1].role = Role.Participant
        return seed
    }

    context('Creating a new Evaluation', () => {
        const user = users[2]
        const evalUserIsFacilitator = createEvaluation(user, users[0], 'user is Facilitator')
        const evalUserIsParticipant = createEvaluation(users[0], user, 'user is Participant')
        const evalUserIsNotInEvaluation = createEvaluation(users[0], users[1], 'user is not in evaluation')
        const previousEvaluations = [evalUserIsFacilitator, evalUserIsParticipant, evalUserIsNotInEvaluation]

        before(() => {
            evalUserIsFacilitator.plant()
            evalUserIsParticipant.plant()
            evalUserIsNotInEvaluation.plant()
        })

        beforeEach(() => {
            cy.visitProject(user)
        })

        it('Without setting a previous evaluation', () => {
            const name = evaluationName({ prefix: 'CreatedWithoutPrevLink' })

            const projectPage = new ProjectPage()
            projectPage.createEvaluationButton().click()

            const dialog = new ProjectPage.CreateEvaluationDialog()
            dialog.createEvaluation(name)

            const nominationPage = new NominationPage()
            nominationPage.evaluationTitle().should('have.text', name)
        })

        previousEvaluations.forEach(previous => {
            it(`Choosing a previous evaluation where ${previous.name}`, () => {
                const name = evaluationName({ prefix: 'CreatedWithPrevLink' })

                const projectPage = new ProjectPage()
                projectPage.createEvaluationButton().click()

                const dialog = new ProjectPage.CreateEvaluationDialog()
                dialog.createEvaluation(name, previous.name)

                const nominationPage = new NominationPage()
                nominationPage.evaluationTitle().should('have.text', name)
            })
        })
    })

    context('Progressing an Evaluation', () => {
        let seed: EvaluationSeed
        const evaluationPage = new EvaluationPage()
        const nominationPage = new NominationPage()

        beforeEach(() => {
            const progression = Progression.Nomination
            seed = new EvaluationSeed({
                progression,
                users: getUsers(3),
            })
            seed.plant()
        })

        it('FACILITATOR can progress from nomination', () => {
            const progression = Progression.Nomination

            expect(seed.participants[0].role).to.equal(Role.Facilitator)
            cy.visitEvaluation(seed.evaluationId, seed.participants[0].user)

            nominationPage.finishNominationButton().click()
            cy.get('[data-testid=yes_button]').click()

            cy.contains('a', 'Complete').should('exist')
            evaluationPage.progressionStepLink(progression).contains('Complete').should('exist')
        })
    })
})
