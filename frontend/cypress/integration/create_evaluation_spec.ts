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

const evaluationUserIsNotInIt = () => {
    return new EvaluationSeed({
        nParticipants: 2,
        namePrefix: 'user is not part of this Evaluation'
    })
}


describe('Creating a new Evaluation', () => {
    const user: User = users[2]
    let userIsFacilitator: EvaluationSeed
    let userIsParticipant: EvaluationSeed
    let userIsNotInEvaluation: EvaluationSeed

    before( () => {
        cy.login()
        cy.interceptExternal()
        userIsFacilitator = evaluationUserIsFacilitator()
        userIsParticipant = evaluationUserIsParticipant()
        userIsNotInEvaluation = evaluationUserIsNotInIt()

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

    it('Without setting a previous evaluation', () => {
        const name = evaluationName({prefix: 'CreatedWithoutPrevLink'})

        const projectPage = new ProjectPage()
        projectPage.createEvaluationButton().click()

        const dialog = new ProjectPage.CreateEvaluationDialog()
        dialog.createEvaluation(name)

        const nominationPage = new NominationPage()
        nominationPage.evaluationTitle().should('have.text', name)
    })

    it('Choosing a previous evaluation where user is Participant', () => {
        const name = evaluationName({prefix: 'CreatedWithPrevLink'})

        const projectPage = new ProjectPage()
        projectPage.createEvaluationButton().click()

        const dialog = new ProjectPage.CreateEvaluationDialog()
        dialog.createEvaluation(name, userIsParticipant.name)

        const nominationPage = new NominationPage()
        nominationPage.evaluationTitle().should('have.text', name)
    })

    it('Choosing a previous evaluation where user is Facilitator', () => {
        const name = evaluationName({prefix: 'CreatedWithPrevLink'})

        const projectPage = new ProjectPage()
        projectPage.createEvaluationButton().click()

        const dialog = new ProjectPage.CreateEvaluationDialog()
        dialog.createEvaluation(name, userIsFacilitator.name)

        const nominationPage = new NominationPage()
        nominationPage.evaluationTitle().should('have.text', name)
    })

    it('Choosing a previous evaluation that user is not part of', () => {
        const name = evaluationName({prefix: 'CreatedWithPrevLink'})

        const projectPage = new ProjectPage()
        projectPage.createEvaluationButton().click()

        const dialog = new ProjectPage.CreateEvaluationDialog()
        dialog.createEvaluation(name, userIsNotInEvaluation.name)

        const nominationPage = new NominationPage()
        nominationPage.evaluationTitle().should('have.text', name)
    })
})
