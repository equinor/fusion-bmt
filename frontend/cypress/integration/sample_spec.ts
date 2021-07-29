/* Sample test. To be removed later
 */

import ProjectPage from '../support/project'
import NominationPage from '../support/nomination'
import users from '../support/users'


describe('Sample tests', () => {
    beforeEach(() => {
        cy.visitProject(users[0])
    })

    it('User can create evaluation & assign people', () => {
        const evaluationName = 'Evaluation-' + Date.now()

        const projectPage = new ProjectPage()
        projectPage.createEvaluationButton().click()

        const createEvaluationDialog = new ProjectPage.CreateEvaluationDialog()
        createEvaluationDialog.nameTextField().type(evaluationName)
        createEvaluationDialog.createButton().click()

        const nominationPage = new NominationPage()
        nominationPage.evaluationTitle().should('have.text', evaluationName)
        // TODO: should we query GraphQL too to check evaluation there?

        // in reality test should stop here
        // then new test "Add People" should start here
        // database should be seeded with Evaluation on Nomination stage
        // user should open webpage already on Nomination

        nominationPage.addPersonButton().click()
        const nomineeDialog = new NominationPage.NomineeDialog()
        users.slice(1).forEach(user => {
            nomineeDialog.searchAndAddPerson(user)
        })

        nomineeDialog.close()
        users.forEach(user => {
            nominationPage.assertParticipantAdded(user)
        })
    })
})

