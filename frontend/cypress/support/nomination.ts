import { User } from './users'

export default class NominationPage {
    evaluationTitle = () => {
        return cy.get('[data-testid=evaluation_title]')
    }

    addPersonButton = () => {
        return cy.contains('Add Person')
    }

    participantsTable = () => {
        /* fusion doesn't have a property we can use and we also don't have any
         * explicit elements in the code we can grab.
         * As of now, leave locator as class and lets see how fast it will fail
         */
        return cy.get('.fc--DataTable__table--2C1Xm')
    }

    assertParticipantAdded = (user: User) => {
        this.participantsTable().within(() => {
            cy.contains(user.name).should('exist')
        })
    }

    static NomineeDialog = class {
        body = () => {
            /* Unable to use pure dialog
             * fusion doesn't accept our data-testid
             * and seems to ignore just "id" on ModalSideSheetProps.
             * Reasons for the behavior are unclear.
             */
            return cy.get('[data-testid=nominee_dialog_body]')
        }

        searchPersonTextBox = () => {
            return cy.get('[data-testid=nominee_dialog_search_text_field]')
        }

        searchAndAddPerson = (user: User) => {
            this.searchPersonTextBox().clear().type(user.username)
            this.body().within(() => {
                cy.contains(user.name).should('exist')
            })

            // relying on the stubbed behavior: only 1 result returned
            this.body().within(() => {
                cy.contains('Add').should('exist').click()
            })
        }

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
}
