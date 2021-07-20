import users, { User } from './users'

/* Visit the Evaluation as a specific user */
Cypress.Commands.add('visitEvaluation', (evaluationId: string, user: User=users[0]) => {
    cy.login(user)
    const port = Cypress.env('FRONTEND_PORT') || '3000'
    cy.visit(`http://localhost:${port}/123`)
    cy.visit(`http://localhost:${port}/123/evaluation/${evaluationId}`)
    cy.wait(1000) // A poor solution tbh
})

declare global {
    namespace Cypress {
        interface Chainable {
            visitEvaluation(evaluationId: string, user: User): void
        }
    }
}
