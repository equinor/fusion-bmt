import { users } from '../support/mock/external/users'
import * as faker from 'faker'
import { Organization } from '../../src/api/models'
import { edit } from '@equinor/eds-icons'

describe('Admin page', () => {
    beforeEach(() => {
        const user = users[users.length - 1]
        cy.visitProject(user)
        cy.get('button').contains('Admin').click()
        cy.contains('Project configuration: Questionnaire').should('be.visible')
    })

    it('Edit question - change title, support notes and organization', () => {
        cy.get('[id^=question-]').then(questions => {
            var questionsCount = Cypress.$(questions).length
            const questionNo = faker.datatype.number({ min: 1, max: questionsCount })
            const newTitle = 'This is the new title' + faker.random.words(2)
            const newSupportNotes = 'These are the new support notes!!!' + faker.random.words(2)
            cy.getByDataTestid('organization-' + questionNo).then(function (t) {
                let currentOrg = Cypress.$(t).text()
                let organization = faker.random.arrayElement(Object.keys(Organization).filter(t => t !== currentOrg))

                changeQuestionFields(questionNo, newTitle, newSupportNotes, organization)
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
    })
    it('Cancel Edit question - changes to title, support notes and organization are not saved', () => {
        cy.get('[id^=question-]').then(questions => {
            var questionsCount = Cypress.$(questions).length
            const questionNo = faker.datatype.number({ min: 1, max: questionsCount })
            const newTitle = 'This is the new title' + faker.random.words(2)
            const newSupportNotes = 'These are the new support notes!!!' + faker.random.words(2)
            cy.getByDataTestid('organization-' + questionNo).then(function (t) {
                let currentOrg = Cypress.$(t).text()
                let organization = faker.random.arrayElement(Object.keys(Organization).filter(t => t !== currentOrg))
                changeQuestionFields(questionNo, newTitle, newSupportNotes, organization)
                cy.getByDataTestid('cancel-edit-question').click()
                cy.getByDataTestid('question-title-' + questionNo).should('not.have.text', newTitle)
                cy.getByDataTestid('organization-' + questionNo).should('not.have.text', organization)
                cy.getByDataTestid('question-title-' + questionNo)
                    .next()
                    .next()
                    .should('not.have.text', newSupportNotes)
            })
        })
    })
    it('Navigate to a barrier', () => {
        cy.get('button').contains('Admin').click()
        cy.get('a').contains('PS1 Containment').click()
        cy.get('h3').contains('Containment').should('be.visible')
    })
})

const changeQuestionFields = (questionNo: number, newTitle: string, newSupportNotes: string, organization: string) => {
    cy.getByDataTestid('edit-question-' + questionNo).click()
    cy.getByDataTestid('question-title-' + questionNo).clear()
    cy.getByDataTestid('question-title-' + questionNo).type(newTitle)
    cy.getByDataTestid('markdown-editor')
        .shadow()
        .within(() => {
            cy.get('[id=editor]').replace(newSupportNotes)
        })
    cy.get('label')
        .contains('Organization')
        .next()
        .click()
        .clear()
        .type(organization + '{enter}')
    cy.get('label').contains('Organization').next().invoke('attr', 'value').should('eq', organization)
}
