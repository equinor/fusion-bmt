import { SideSheet } from './common'
import { Action, Note } from './mocks'
import { FUSION_DATE_LOCALE } from './helpers'
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

    notesDiv = () => {
        return cy.getByDataTestid('notes_list')
    }

    completedSwitch = () => {
        return this.body()
            .contains('Completed')
            .then($el => cy.wrap($el).find('input'))
    }

    onHoldSwitch = () => {
        return this.body()
            .contains('On hold')
            .then($el => cy.wrap($el).find('input'))
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
        ;[...notes].reverse().forEach((note, index) => {
            this.notesDiv().children().eq(index).as('note')
            cy.get('@note').should('contain.text', note.createdBy.user.name + ' wrote')
            cy.get('@note').contains(note.text).should('exist')
            // TODO: time not checked. Need to figure out if it can be done reasonably
        })
        this.completedSwitch().should(action.completed ? 'be.checked' : 'be.not.checked')
        this.onHoldSwitch().should(action.onHold ? 'be.checked' : 'be.not.checked')
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
