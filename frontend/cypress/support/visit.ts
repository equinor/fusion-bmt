import { User } from './users'

function setupEnvironment() {
    cy.interceptExternal()
    cy.viewport(1800, 1000) //until we decide to test on various resolutions
}

function waitForProjectPageLoad() {
    cy.get('body').then(body => {
        /**
         * Two cases possible: either we already are on the Project page
         * and "Loading" element is long gone, or page didn't even start
         * loading and element is not there yet.
         */
        if (body.find('div:contains(Evaluation)').length === 0) {
            cy.contains('Loading', { timeout: 10000 }).should('exist')
        }
        cy.contains('Loading', { timeout: 20000 }).should('not.exist')
    })
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

/**
 * Saves project data in cache the same way fusion does.
 * At the moment only default project is supported.
 */
function setProjectCache() {
    // project 123 only
    cy.fixture('project.json').then(json => {
        const project = {
            current: json,
        }
        window.localStorage.setItem('FUSION_CURRENT_CONTEXT', JSON.stringify(project))
    })
}

Cypress.Commands.add('visitProject', (user: User, fusionProjectId: string = '123') => {
    setupEnvironment()
    setProjectCache()

    cy.login(user)
    const frontendUrl = Cypress.env('FRONTEND_URL') || 'http://localhost:3000'

    cy.visit(`${frontendUrl}/${fusionProjectId}`)
    waitForProjectPageLoad()
})

Cypress.Commands.add('visitEvaluation', (evaluationId: string, user: User, fusionProjectId: string = '123') => {
    setupEnvironment()
    setProjectCache()

    cy.login(user)
    const frontendUrl = Cypress.env('FRONTEND_URL') || 'http://localhost:3000'

    cy.visit(`${frontendUrl}/${fusionProjectId}`)
    waitForProjectPageLoad()

    cy.visit(`${frontendUrl}/${fusionProjectId}/evaluation/${evaluationId}`)
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
