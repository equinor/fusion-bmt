/* It's not clear yet if common components won't clash with each other */
export class ConfirmationDialog {
    self = () => {
        return cy.get('[data-testid=confirmation_dialog]')
    }

    yesButton = () => {
        return cy.get('[data-testid=yes_button]')
    }

    noButton = () => {
        return cy.get('[data-testid=no_button]')
    }
}

export abstract class SideSheet {
    /**
     * Must indicate the top area we have control of
     * (aka first element inside (Modal)SideSheet)
     */
    abstract body(): Cypress.Chainable

    close = () => {
        /* might not be stable as we can't directly grab dialog handle */
        this.body()
            .parent()
            .parent()
            .parent()
            .within(() => {
                cy.get('div[class*="close"]').click()
            })
    }
}

Cypress.Commands.add('testCacheAndDB', (testCache: Function, testDB: Function = testCache) => {
    testCache()
    cy.reloadBmt()
    testDB()
})

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
            testCacheAndDB(testCache: Function, testDB?: Function): Cypress.Chainable<void>
        }
    }
}
