import { users } from '../support/mock/external/users'
import * as faker from 'faker'
import { Organization } from '../../src/api/models'

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
            cy.getByDataTestid('organization-' + questionNo).then(t => {
                const currentOrg = Cypress.$(t).text()
                const newOrganization = faker.random.arrayElement(Object.keys(Organization).filter(t => t !== currentOrg))
                const newTitle = 'This is the new title' + faker.random.words(2)
                const newSupportNotes = 'These are the new support notes!!!' + faker.random.words(2)
                changeQuestionFields(questionNo, newTitle, newSupportNotes, newOrganization)
                cy.getByDataTestid('save-question').click()
                verifyQuestion(questionNo, newTitle, newOrganization, newSupportNotes)
            })
        })
    })

    it('Cancel Edit question - changes to title, support notes and organization are not saved and original values visible', () => {
        cy.get('[id^=question-]').then(questions => {
            var questionsCount = Cypress.$(questions).length
            const questionNo = faker.datatype.number({ min: 1, max: questionsCount })
            cy.getByDataTestid('organization-' + questionNo).then(t => {
                let currentOrg = Cypress.$(t).text()
                let newOrganization = faker.random.arrayElement(Object.keys(Organization).filter(t => t !== currentOrg))
                cy.getByDataTestid('question-title-' + questionNo).then(title => {
                    let currentTitle = Cypress.$(title).text()
                    cy.getByDataTestid('question-title-' + questionNo)
                        .next()
                        .next()
                        .then(supportNotes => {
                            let currentSupportNotes = Cypress.$(supportNotes).text()
                            const newTitle = 'This is the new title' + faker.random.words(2)
                            const newSupportNotes = 'These are the new support notes!!!' + faker.random.words(2)
                            changeQuestionFields(questionNo, newTitle, newSupportNotes, newOrganization)
                            cy.getByDataTestid('cancel-edit-question').click()
                            verifyQuestion(questionNo, currentTitle, currentOrg, currentSupportNotes)
                        })
                })
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
    cy.getByDataTestid('question-title-' + questionNo).replace(newTitle)
    cy.getByDataTestid('markdown-editor')
        .shadow()
        .within(() => {
            cy.get('[id=editor]').replace(newSupportNotes)
        })
    cy.get('label')
        .contains('Organization')
        .next()
        .click()
        .replace(organization + '{enter}')
    cy.get('label').contains('Organization').next().invoke('attr', 'value').should('eq', organization)
}

const verifyQuestion = (questionNo: number, title: string, organization: string, supportNotes: string) => {
    cy.getByDataTestid('question-title-' + questionNo).should('have.text', title)
    cy.getByDataTestid('organization-' + questionNo).should('have.text', organization)
    cy.get(`[id=question-${questionNo}]`).should('contain.text', supportNotes)
}
