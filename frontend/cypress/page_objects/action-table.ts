import { Question } from '../../src/api/models'
import { Action } from '../support/testsetup/mocks'
import { barrierToString, organizationToString } from '../../src/utils/EnumToString'
import { mapPriority } from '../page_objects/action'
/**
 * Actions Table on the Follow-Up page
 */
export class ActionTable {
    action = (actionTitle: string) => {
        return cy.contains(actionTitle)
    }
    table = () => {
        return cy.getByDataTestid('action-table')
    }

    assertActionValues = (action: Action, question: Question) => {
        cy.getByDataTestid('action-' + action.id)
            .children()
            .as('row')
        cy.log('ACTION ' + action.title)
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
