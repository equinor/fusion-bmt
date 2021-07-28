import { User } from './users'

function setupEnvironment() {
    cy.interceptExternal()
    cy.viewport(1800, 1000) //until we decide to test on various resolutions
}

function waitForFusionPageLoad() {
    cy.contains('Please select a project.').should('exist')
}

function waitForProjectPageLoad() {
    cy.contains('Loading').should('exist')
    cy.contains('Loading', { timeout: 10000 }).should('not.exist')
}

function waitForEvaluationPageLoad() {
    /**
     * Note that evaluation page is not loaded yet, because each tab
     * will load more content. Not waiting for it might cause issues, but
     * every test should care about that for itself
     */
    cy.contains('Please select a project.').should('not.exist')
    cy.contains('Loading').should('not.exist')
    cy.contains('Workshop Assessment').should('be.visible')
}

Cypress.Commands.add('visitProject', (user: User, fusionProjectId: string = '123') => {
    setupEnvironment()
    cy.login(user)
    const port = Cypress.env('FRONTEND_PORT') || '3000'

    cy.visit(`http://localhost:${port}`)
    waitForFusionPageLoad()

    cy.visit(`http://localhost:${port}/${fusionProjectId}`)
    waitForProjectPageLoad()
})

Cypress.Commands.add('visitEvaluation', (evaluationId: string, user: User, fusionProjectId: string = '123') => {
    setupEnvironment()
    cy.login(user)
    const port = Cypress.env('FRONTEND_PORT') || '3000'

    cy.visit(`http://localhost:${port}`)
    waitForFusionPageLoad()

    cy.visit(`http://localhost:${port}/${fusionProjectId}`)
    waitForProjectPageLoad()

    cy.visit(`http://localhost:${port}/${fusionProjectId}/evaluation/${evaluationId}`)
    waitForEvaluationPageLoad()
})

Cypress.Commands.add('reloadBmt', (user: User, fusionProjectId: string = '123') => {
    /**
     * Situation with reload is quite weird. At the moment all problems are
     * solved by having
     *     "chromeWebSecurity": false
     * in cypress.json, but it works only in Chrome-based browsers.
     *
     * Without that reload causes weird issues most likely related to clash
     * between Cypress and external calls we have no control over.
     *
     * Code below seems to work in majority of cases on all the browsers,
     * but intercept-reload related errors still happen.
     *
     * It's also not clear if there is a difference between reload and revisit,
     * so it might be that cy.visit(url) is enough in our case.
     */
    cy.url()
        .then(url => cy.visit(url))
        .then(() => cy.reload())
    setupEnvironment()

    /* as we don't know what we reload, we can't wait for anything useful */
    cy.contains('Loading').should('not.exist')
})

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Visit project as a specific user
             * @example cy.visitProject(user)
             */
            visitProject(user: User, fusionProjectId?: string): Chainable<void>

            /**
             * Visit evaluation as a specific user
             * @example cy.visitEvaluation(evaluationId, extHire)
             */
            visitEvaluation(evaluationId: string, user: User, fusionProjectId?: string): Chainable<void>

            /**
             * Reloads the page and attempts to deal with external dependencies issues
             * @example cy.visitProject(user)
             */
            reloadBmt(): Chainable<void>
        }
    }
}
