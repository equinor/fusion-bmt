import { users } from '../support/mock/external/users'
import * as faker from 'faker'
import { Organization } from '../../src/api/models'

describe('Admin page', () => {
    beforeEach(() => {
        const user = users[users.length - 1]
        cy.visitProject(user)
    })

    it.only('Edit question - change title, support notes and  ', () => {
        cy.get('[id^=question-]').then(questions => {
            var questionsCount = Cypress.$(questions).length

            const questionNo = faker.datatype.number({ min: 1, max: questionsCount })
            const newTitle = 'This is the new title'
            const newSupportNotes = 'These are the new support notes!!!'
            cy.get('button').contains('Admin').click()
            cy.contains('Project configuration: Questionnaire').should('be.visible')
            cy.getByDataTestid('edit-question-' + questionNo).click()
            cy.getByDataTestid('question-title-' + questionNo).clear()
            cy.getByDataTestid('question-title-' + questionNo).type(newTitle)
            cy.getByDataTestid('markdown-editor')
                .shadow()
                .within(() => {
                    cy.get('[id=editor]').replace(newSupportNotes)
                })
            const organization = faker.random.arrayElement(Object.keys(Organization))
            cy.get('label')
                .contains('Organization')
                .next()
                .click()
                .clear()
                .type(organization + '{enter}')
            cy.get('label').contains('Organization').next().invoke('attr', 'value').should('eq', organization)

            cy.getByDataTestid('save-question').click()
            cy.getByDataTestid('question-title-' + questionNo).should('have.text', newTitle)
            cy.getByDataTestid('organization-' + questionNo).should('have.text', organization)
            cy.getByDataTestid('question-title-' + questionNo)
                .parent()
                .within(() => {
                    cy.contains(newSupportNotes).should('be.visible')
                })
        })
    })
    it('Navigate to a barrier', () => {
        cy.get('button').contains('Admin').click()
        cy.get('a').contains('PS1 Containment').click()
        cy.get('h3').contains('Containment').should('be.visible')
    })
})
