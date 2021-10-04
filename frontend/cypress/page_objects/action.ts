import { DropdownSelect, SideSheet } from '../page_objects/common'
import { Action, Note } from '../support/testsetup/mocks'
import { FUSION_DATE_LOCALE } from '../support/helpers/helpers'
import { Priority, Question } from '../../src/api/models'
import { barrierToString, organizationToString } from '../../src/utils/EnumToString'

/**
 * List of actions under every question
 */
export class ActionsGrid {
    /**
     * Get Add Action button for provided question
     * @param questionOrder : order of question, starts from 1
     */
    addActionButton = (questionNumber: number) => {
        return cy.get(`#question-${questionNumber}`).contains('Add action')
    }

    actionLink = (questionNumber: number, actionTitle: string) => {
        return cy.get(`#question-${questionNumber}`).contains(actionTitle)
    }

    actionCompleteDiv = (id: string) => {
        return cy.getByDataTestid(`action_complete_${id}`)
    }

    deleteActionButton = (id: string) => {
        return cy.getByDataTestid(`delete_action_button_${id}`)
    }
}

/**
 * Actions Tab on the Follow-Up page
 */
export class ActionsTab {
    linkToTab = () => {
        return cy.get('#fixed-tablist').contains('Actions')
    }

    body = () => {
        return this.linkToTab()
            .invoke('attr', 'aria-controls')
            .then(id => {
                return cy.get('#' + id)
            })
    }

    assertActionValues = (action: Action, question: Question) => {
        this.body().contains(action.title).parent().children().as('row')

        cy.get('@row').eq(0).should('have.text', action.title)
        cy.get('@row').eq(1).should('have.text', barrierToString(question.barrier))
        cy.get('@row').eq(2).should('have.text', organizationToString(question.organization))
        cy.get('@row')
            .eq(3)
            .should('have.text', action.completed ? 'Yes' : 'No')
        cy.get('@row').eq(4).should('have.text', mapPriority(action.priority))
        cy.get('@row').eq(5).should('have.text', action.assignedTo.user.name)
        cy.get('@row').eq(6).should('have.text', action.dueDate.toLocaleDateString())
    }
}

abstract class ActionDialog extends SideSheet {
    abstract body(): Cypress.Chainable

    titleInput = () => {
        return this.body().contains('Title').for()
    }

    assignedToInput = () => {
        return this.body().contains('Assigned to').next()
    }

    dueDateInput = () => {
        return this.body().contains('Due date').next()
    }

    priorityInput = () => {
        return this.body().contains('Priority').next()
    }

    descriptionInput = () => {
        return this.body().contains('Description').for()
    }

    createButton = () => {
        return this.body().contains('Create')
    }
}

export class CreateActionDialog extends ActionDialog {
    body = () => {
        return cy.getByDataTestid('create_action_dialog_body')
    }
}

export class EditActionDialog extends ActionDialog {
    body = () => {
        return cy.getByDataTestid('edit_action_dialog_body')
    }

    notesInput = () => {
        return cy.get('#noteInProgress')
    }

    addNoteButton = () => {
        return cy.getByDataTestid('add_note_button')
    }

    completedReasonInput = () => {
        return cy.get('#completed-reason')
    }

    completeActionButton = () => {
        return cy.getByDataTestid('complete_action_button')
    }

    completeActionConfirmButton = () => {
        return cy.getByDataTestid('complete_action_confirm_button')
    }

    completeActionCancelButton = () => {
        return cy.getByDataTestid('complete_action_cancel_button')
    }

    notesDiv = () => {
        return cy.getByDataTestid('notes_list')
    }

    actionCompletedText = () => {
        return cy.getByDataTestid('action_completed_text')
    }

    assertClosingNoteExists = (note: Note) => {
        cy.getByDataTestid('closing_note', 10000)
            .should('contain.text', note.createdBy.user.name + ' closed action')
            .within(() => {
                if (note.text) {
                    cy.getByDataTestid('note_text').should('have.text', note.text)
                }
            })
    }

    assertSaved = () => {
        this.body()
            .parent()
            .parent()
            .parent()
            .within(() => {
                cy.getByDataTestid('save_indicator', 10000).should('have.text', 'Saved')
            })
    }

    /**
     * Check provided values on the Edit dialog.
     * @param notes Pass all notes in the order of creation
     */
    assertActionValues = (action: Action, notes: Note[]) => {
        this.titleInput().should('have.value', action.title)
        this.descriptionInput().should('have.value', action.description)
        this.assignedToInput().should('have.value', action.assignedTo.user.name)
        this.priorityInput().should('have.text', mapPriority(action.priority))
        this.dueDateInput().should('have.value', action.dueDate.toLocaleDateString(FUSION_DATE_LOCALE))
        this.assertNotesValues(notes)
    }

    /**
     * Check that all expected notes are present and contain correct values.
     * @param notes Pass all notes in the order of creation
     */
    assertNotesValues = (notes: Note[]) => {
        ;[...notes].reverse().forEach((note, index) => {
            this.notesDiv().children().eq(index).as('note')
            if (note.__typename === 'ClosingRemark') {
                cy.get('@note').should('contain.text', note.createdBy.user.name + ' closed action')
            } else {
                cy.get('@note').should('contain.text', note.createdBy.user.name + ' wrote')
            }
            if (note.text) {
                cy.get('@note').contains(note.text).should('exist')
            }

            // TODO: time not checked. Need to figure out if it can be done reasonably
        })
    }

    /**
     * Insert provided new values into action input fields and dropdown
     * @param notes All new notes to add
     */
    editAction = (updatedAction: Action, newNotes: Note[], oldNotesLength: number) => {
        const dropdownSelect = new DropdownSelect()

        this.titleInput().replace(updatedAction.title)
        dropdownSelect.select(this.assignedToInput(), updatedAction.assignedTo.user.name)
        this.dueDateInput().replace(updatedAction.dueDate.toLocaleDateString(FUSION_DATE_LOCALE))
        dropdownSelect.select(this.priorityInput(), mapPriority(updatedAction.priority))
        this.descriptionInput().replace(updatedAction.description)
        this.assertSaved()
        newNotes.forEach((note, index) => {
            this.notesInput().replace(note.text)
            this.addNoteButton().click()
            this.verifyNoteAdded(oldNotesLength, index + 1)
        })
    }

    /**
     * Verify that the note is added in the view
     */
    verifyNoteAdded = (oldNotesLength: number, numberOfAddedNotes: number) => {
        cy.getByDataTestid(`notes_list`)
            .children({ timeout: 10000 })
            .should('have.length', oldNotesLength + numberOfAddedNotes)
    }

    /**
     * Check that the view reflects whether or not the action is completed
     */
    assertCompletedInView = (completed = false) => {
        this.actionCompletedText().should(completed ? 'be.visible' : 'not.exist')
        this.completeActionButton().should(completed ? 'not.exist' : 'be.visible')
    }

    /**
     * Check complete view elements visibility and attributes
     @param completeViewOpen is view open
     */
    assertCompleteConfirmViewVisible = (completeViewOpen = false) => {
        this.completeActionButton().should(completeViewOpen ? 'be.disabled' : 'be.enabled')
        this.completedReasonInput().should(completeViewOpen ? 'be.visible' : 'not.exist')
        this.completeActionConfirmButton().should(completeViewOpen ? 'be.visible' : 'not.exist')
        this.completeActionCancelButton().should(completeViewOpen ? 'be.visible' : 'not.exist')
    }
}

/**
 * Maps Priority to the way it's written in frontend. TODO: it might be useful
 * to have this mapping in our EnumToString instead
 * @param priority
 */
export const mapPriority = (priority: Priority) => {
    switch (priority) {
        case Priority.Low:
            return 'Low'
        case Priority.Medium:
            return 'Medium'
        case Priority.High:
            return 'High'
    }
}
