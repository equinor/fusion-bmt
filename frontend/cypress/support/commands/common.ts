Cypress.Commands.add('getByDataTestid', (value: string, timeout: number) => {
    return cy.get(`[data-testid=${value}]`, { timeout })
})

Cypress.Commands.add(
    'for',
    {
        prevSubject: 'element',
    },
    subject => {
        cy.wrap(subject)
            .invoke('attr', 'for')
            .then(id => {
                return cy.get('#' + id)
            })
    }
)

Cypress.Commands.add(
    'replace',
    {
        prevSubject: 'element',
    },
    (subject, text) => {
        return cy.wrap(subject).type(`{selectall}{backspace}${text}`)
    }
)

Cypress.Commands.add('testCacheAndDB', (testCache: Function, fusionProjectId: string, testDB: Function = testCache) => {
    testCache()
    cy.reloadBmt(fusionProjectId)
    testDB()
})

export {}

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Often we update the code in two places: cache and db.
             * It might be useful to run a final check before
             * and after reloading the page. If only one parameter is provided,
             * it is assumed same check must be performed before and after
             * page reload.
             * @example cy.testCacheAndDB({assert(true)})
             */
            testCacheAndDB(testCache: Function, fusionProjectId: string, testDB?: Function): Cypress.Chainable

            /**
             * Clear + type + enter. Also works on elements clear doesn't always work on
             */
            replace(text: string): Cypress.Chainable
            /**
             * Get input for label
             */
            for(): Cypress.Chainable
            /**
             * Get element with expected data-testid. At the moment searches only globally
             * @param value Element's data-testid
             * @param timeout Max waiting time
             */
            getByDataTestid(value: string, timeout?: number): Cypress.Chainable
        }
    }
}
