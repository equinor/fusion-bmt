import { User } from './mock/external/users'
import { SideSheet } from './common'

export default class NominationPage {
    evaluationTitle = () => {
        return cy.get('[data-testid=evaluation_title]')
    }

    addPersonButton = () => {
        return cy.contains('Add Person')
    }

    deletePerson = (user: User) => {
        this.deletePersonDiv(user).within(() => {
            cy.contains('Delete').click()
        })
    }

    deletePersonDiv = (user: User) => {
        return cy.get(`[data-testid=delete_button_${user.id}]`)
    }

    participantsTable = () => {
        /* fusion doesn't have a property we can use and we also don't have any
         * explicit elements in the code we can grab.
         * As of now, leave locator as class and lets see how fast it will fail
         */
        return cy.get('.fc--DataTable__table--2C1Xm')
    }

    assertParticipantPresent = (user: User) => {
        this.participantsTable().contains(user.name).should('exist')
    }

    assertParticipantAbsent = (user: User) => {
        this.participantsTable().contains(user.name).should('not.exist')
    }

    static NomineeDialog = class extends SideSheet {
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
            this.body().contains(user.name).should('exist')

            // relying on the stubbed behavior: only 1 result returned
            this.body().contains('Add').should('exist').click()
        }
    }
}
