// TODO: login stuff: where, what, how, etc
beforeEach(() => {
    cy.login()
    const port = Cypress.env('FRONTEND_PORT') || '3000'
    cy.visit(`http://localhost:${port}/123`)
})

describe('Sample Test', () => {
    it('Works', () => {
        expect(true).to.equal(true)
    })
})
