import { users } from '../support/mock/external/users'
import * as faker from 'faker'
import { Organization } from '../../src/api/models'
import { AdminPage } from '../page_objects/admin_page'

const adminPage = new AdminPage()
describe('Admin page', () => {
    beforeEach(() => {
        const user = users[users.length - 1]
        cy.visitProject(user)
        adminPage.adminButton().click()
        adminPage.adminPageTitle().should('have.text', 'Project configuration: Questionnaire')
    })

    it('Edit question - change title, support notes and organization', () => {
        adminPage.allQuestions().then(questions => {
            var questionsCount = Cypress.$(questions).length
            const questionNo = faker.datatype.number({ min: 1, max: questionsCount })
            adminPage.organization(questionNo).then(t => {
                const currentOrg = Cypress.$(t).text()
                const newOrganization = faker.random.arrayElement(Object.keys(Organization).filter(t => t !== currentOrg))
                const newTitle = 'This is the new title' + faker.random.words(2)
                const newSupportNotes = 'These are the new support notes!!!' + faker.random.words(2)
                changeQuestionFields(questionNo, newTitle, newSupportNotes, newOrganization)
                adminPage.saveEditButton().click()
                verifyQuestion(questionNo, newTitle, newOrganization, newSupportNotes)
            })
        })
    })

    it('Cancel Edit question - changes to title, support notes and organization are not saved and original values visible', () => {
        adminPage.allQuestions().then(questions => {
            var questionsCount = Cypress.$(questions).length
            const questionNo = faker.datatype.number({ min: 1, max: questionsCount })
            adminPage.organization(questionNo).then(t => {
                let currentOrg = Cypress.$(t).text()
                let newOrganization = faker.random.arrayElement(Object.keys(Organization).filter(t => t !== currentOrg))
                adminPage.questionTitle(questionNo).then(title => {
                    let currentTitle = Cypress.$(title).text()
                    adminPage.supportNotes(questionNo).then(supportNotes => {
                        let currentSupportNotes = Cypress.$(supportNotes).text()
                        const newTitle = 'This is the new title' + faker.random.words(2)
                        const newSupportNotes = 'These are the new support notes!!!' + faker.random.words(2)
                        changeQuestionFields(questionNo, newTitle, newSupportNotes, newOrganization)
                        adminPage.cancelEditButton().click()
                        verifyQuestion(questionNo, currentTitle, currentOrg, currentSupportNotes)
                    })
                })
            })
        })
    })

    it('Navigate to a barrier', () => {
        adminPage.adminButton().click()
        adminPage.barrierInSideBar('PS1 Containment').click()
        adminPage.barrierTitleOnTopOfPage().should('have.text', 'Containment')
    })
})

const changeQuestionFields = (questionNo: number, newTitle: string, newSupportNotes: string, organization: string) => {
    adminPage.editQuestionButton(questionNo).click()
    adminPage.questionTitle(questionNo).replace(newTitle)
    adminPage.deleteAndInsertSupportNotes(newSupportNotes)
    adminPage.changeOrganization(organization)
}

const verifyQuestion = (questionNo: number, title: string, organization: string, supportNotes: string) => {
    adminPage.questionTitle(questionNo).should('have.text', title)
    adminPage.organization(questionNo).should('have.text', organization)
    adminPage.question(questionNo).should('contain.text', supportNotes)
}
