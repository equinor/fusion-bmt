import { Progression, Role } from '../../src/api/models'
import { EvaluationSeed } from '../support/evaluation_seed'
import { evaluationName } from '../support/helpers'
import NominationPage from '../support/nomination'
import ProjectPage from '../support/project'
import { getUsers, users, User } from '../support/mock/external/users'
import * as faker from 'faker'
import { EvaluationPage } from '../support/evaluation'
import { ConfirmationDialog } from '../support/common'

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
        const evalUserIsFacilitator = createEvaluation(user, users[0], roles, 'user is Facilitator')
        const evalUserIsParticipant = createEvaluation(users[0], user, roles, 'user is Participant')
        const evalUserIsNotInEvaluation = createEvaluation(users[0], users[1], roles, 'user is not in evaluation')
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
            dialog.createEvaluation(name, 'SquareField')

            const nominationPage = new NominationPage()
            nominationPage.evaluationTitle().should('have.text', name)
        })

        previousEvaluations.forEach(previous => {
            it(`Choosing a previous evaluation where ${previous.name}`, () => {
                const name = evaluationName({ prefix: 'CreatedWithPrevLink' })

                const projectPage = new ProjectPage()
                projectPage.createEvaluationButton().click()

                const dialog = new ProjectPage.CreateEvaluationDialog()
                dialog.createEvaluation(name, 'SquareField', previous.name)

                const nominationPage = new NominationPage()
                nominationPage.evaluationTitle().should('have.text', name)
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
