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

/**
 * Expected to work on fusion selects (elements as buttons) which appear
 * in different place in the DOM, but which all contain "section".
 * Such selects appears in different place in the dom.
 * They seem impossible to identify by any other means
 */
export class DropdownSelect {
    /**
     * Selection list should already be open (one and only one)
     *
     * @param expected: full list of values
     */
    assertSelectValues = (expected: string[]) => {
        cy.get('section').children().its('length').should('eq', expected.length)
        expected.forEach(e => {
            cy.get('section').contains(e).should('exist')
        })
    }

    /**
     * Select value with text from the list
     * @param selectInput
     * @param text
     */
    select = (selectInput: Cypress.Chainable, text: string) => {
        selectInput.click()
        cy.get('section').contains('span', text).click()
    }
}

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

            /**
             * Clear + type + enter. Also works on elements clear doesn't always work on
             */
            replace(text: string): Cypress.Chainable<Element>
            /**
             * Get input for label
             */
            for(): Cypress.Chainable<Element>
            /**
             * Get element with expected data-testid. At the moment searches only globally
             * @param value Element's data-testid
             * @param timeout Max waiting time
             */
            getByDataTestid(value: string, timeout?: number): Cypress.Chainable<Element>
        }
    }
}
