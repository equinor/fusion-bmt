import { users } from '../support/mock/external/users'
 
describe('Admin page', () => {
    before(() => {
        const user = users[users.length - 1]
        cy.visitProject(user)
    })

    it('Navigate to Admin page', () => {
        cy.get('button').contains('Admin').click()
        cy.contains('Project configuration: Questionnaire').should('be.visible')
    })

    it('Navigate to a barrier', () => {
        cy.get('a').contains('PS1 Containment').click()
        cy.get('h3').contains('Containment').should('be.visible')
    })
})
