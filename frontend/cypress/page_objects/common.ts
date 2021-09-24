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
