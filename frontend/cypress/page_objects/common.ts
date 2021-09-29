import { SavingState } from '../../src/utils/Variables'

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

export class MarkdownEditor {
    setContent = (content: string) => {
        cy.get('fusion-markdown-editor')
            .shadow()
            .within(() => {
                cy.get('[id=editor]').replace(content)
            })
    }

    assertContent = (content: string) => {
        cy.contains(content, { includeShadowDom: true }).should('be.visible')
    }
}

export class SaveIndicator {
    assertState = (state: SavingState) => {
        if (state === SavingState.Saved) {
            cy.getByDataTestid('save_indicator', 10000).should('have.text', 'Saved')
        } else {
            throw new Error('SavingState Saving, NotSaved and None not implemented for tests.')
        }
    }
}
