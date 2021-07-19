import { Role } from '../../src/api/models'
import { EvaluationSeed } from '../support/evaluation_seed'
import { evaluationName } from '../support/helpers'
import NominationPage from '../support/nomination'
import ProjectPage from '../support/project'
import users, { User } from '../support/users'


const evaluationUserIsFacilitator = () => {
    let seed = new EvaluationSeed({
        nParticipants: 3,
        namePrefix: 'user is Facilitator'
    })
    let user  = seed.participants[2]
    user.role = Role.Facilitator
    return seed
}

const evaluationUserIsParticipant = () => {
    return new EvaluationSeed({
        nParticipants: 3,
        namePrefix: 'user is Participant'
    })
}

const evalutionUserIsNotInIt = () => {
    return new EvaluationSeed({
        nParticipants: 2,
        namePrefix: 'user is not part of this Evaluation'
    })
}


describe('Creating new Evaluations', () => {
    const user: User = users[2]
    let userIsFacilitator: EvaluationSeed
    let userIsParticipant: EvaluationSeed
    let userIsNotInEvaluation: EvaluationSeed

    before( () => {
        cy.login()
        cy.interceptExternal()
        userIsFacilitator = evaluationUserIsFacilitator()
        userIsParticipant = evaluationUserIsParticipant()
        userIsNotInEvaluation = evalutionUserIsNotInIt()

        userIsFacilitator.plant()
        userIsParticipant.plant()
        userIsNotInEvaluation.plant()
    })

    beforeEach( () => {
        cy.login(user)
        const port = Cypress.env('FRONTEND_PORT') || '3000'
        cy.visit(`http://localhost:${port}/123`)
        cy.wait(1000) //const wait is not good, but don't know how to make it stable
    })

    context('Without a link to a previous evaluation', () => {
        it('Can be created', () => {
            const name = evaluationName({prefix: 'CreatedWithoutPrevLink'})

            const projectPage = new ProjectPage()
            projectPage.createEvaluationButton().click()

            const dialog = new ProjectPage.CreateEvaluationDialog()
            dialog.nameTextField().type(name)
            dialog.createButton().click()

            const nominationPage = new NominationPage()
            nominationPage.evaluationTitle().should('have.text', name)
        })
    })

    context('With a link to a previous evaluation', () => {
        it('Evaluation where user is a Participant is selectable', () => {
            const name = evaluationName({prefix: 'CreatedWithPrevLink'})

            const projectPage = new ProjectPage()
            projectPage.createEvaluationButton().click()

            const dialog = new ProjectPage.CreateEvaluationDialog()
            dialog.nameTextField().type(name)
            dialog.previousEvaluation().click().type(`${userIsParticipant.name}{enter}`)
            dialog.createButton().click()
        })

        it('Evaluation where user is a Facilitator is selectable', () => {
            const name = evaluationName({prefix: 'CreatedWithPrevLink'})

            const projectPage = new ProjectPage()
            projectPage.createEvaluationButton().click()

            const dialog = new ProjectPage.CreateEvaluationDialog()
            dialog.nameTextField().type(name)
            dialog.previousEvaluation().click().type(`${userIsFacilitator.name}{enter}`)
            dialog.createButton().click()
        })

        it('Evaluation where user is not a participanting is selectable', () => {
            const name = evaluationName({prefix: 'CreatedWithPrevLink'})

            const projectPage = new ProjectPage()
            projectPage.createEvaluationButton().click()

            const dialog = new ProjectPage.CreateEvaluationDialog()
            dialog.nameTextField().type(name)
            dialog.previousEvaluation().click().type(`${userIsNotInEvaluation.name}{enter}`)
            dialog.createButton().click()
        })

        it('Can be created', () => {
            const name = evaluationName({prefix: 'CreatedWithPrevLink'})

            const projectPage = new ProjectPage()
            projectPage.createEvaluationButton().click()

            const dialog = new ProjectPage.CreateEvaluationDialog()
            dialog.nameTextField().type(name)
            dialog.previousEvaluation().click().type(`${userIsFacilitator.name}{enter}`)
            dialog.createButton().click()

            const nominationPage = new NominationPage()
            nominationPage.evaluationTitle().should('have.text', name)
        })
    })
})
