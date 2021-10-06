import { users, getUserWithAdminRole, getUserWithNoAdminRole } from '../support/mock/external/users'
import * as faker from 'faker'
import { Organization } from '../../src/api/models'
import { AdminPage } from '../page_objects/admin_page'
import { DropdownSelect } from '../page_objects/common'
import { DELETE_QUESTION_TEMPLATE } from '../support/testsetup/gql'
import { activeQuestionTemplates } from '../support/testsetup/evaluation_seed'

const adminPage = new AdminPage()
const selectOrganizationDropdown = 'select-organization-dropdown-box'
describe('Admin page', () => {
    const goToQuestionnaire = () => {
        const adminUser = getUserWithAdminRole()
        cy.visitProject(adminUser)
        adminPage.adminButton().click()
        adminPage.adminPageTitle().should('have.text', 'Project configuration: Questionnaire')
    }
    beforeEach(() => {
        goToQuestionnaire()
    })

    it('Edit question - change title, support notes and organization', () => {
        adminPage.allQuestionNo().then(questions => {
            const questionNo = parseInt(
                questions.toArray()[faker.datatype.number({ min: 0, max: Cypress.$(questions).length - 1 })].innerText.replace('.', '')
            )
            adminPage.organization(questionNo).then(t => {
                const currentOrg = Cypress.$(t).text()
                const newOrganization = faker.random.arrayElement(Object.keys(Organization).filter(t => t !== currentOrg))
                const newTitle = 'This is the new title' + faker.random.words(2)
                const newSupportNotes = 'These are the new support notes!!!' + faker.random.words(3)
                changeQuestionFields(questionNo, newTitle, newSupportNotes, newOrganization)
                adminPage.saveQuestionButton().click()
                verifyQuestion(questionNo, newTitle, newOrganization, newSupportNotes)
            })
        })
    })

    it('Cancel Edit question - changes to title, support notes and organization are not saved and original values visible', () => {
        adminPage.allQuestionNo().then(questions => {
            const questionsCount = Cypress.$(questions).length - 1
            const questionNo = parseInt(
                questions.toArray()[faker.datatype.number({ min: 0, max: questionsCount })].innerText.replace('.', '')
            )
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

    it('Add new question, fill in title, support notes, select organization, verify question was added', () => {
        adminPage.createNewQuestion().click()
        const title = 'title ' + faker.random.word()
        adminPage.newQuestionTitle().type(title)
        const supportNotes = 'supportNotes' + faker.random.words(3)
        adminPage.setSupportNotes(supportNotes)
        const organization = faker.random.arrayElement(Object.keys(Organization))
        const dropdownSelect = new DropdownSelect()
        dropdownSelect.select(cy.getByDataTestid(selectOrganizationDropdown).contains('Organization'), organization)
        adminPage.saveQuestionButton().click()
        cy.testCacheAndDB(() => {
            goToQuestionnaire()
            adminPage
                .allQuestionNo()
                .last()
                .then(qn => {
                    const createdQuestionNo = parseInt(Cypress.$(qn).text().replace('.', ''))
                    adminPage.questionTitle(createdQuestionNo).should('have.text', title)
                    adminPage.supportNotes(createdQuestionNo).should('contain.text', supportNotes)
                    adminPage.organization(createdQuestionNo).should('have.text', organization)
                })
        })
    })

    it('Cancel create new question, verify new question is not added', () => {
        adminPage.allQuestionNo().then(questions => {
            const questionsCount = Cypress.$(questions).length - 1
            adminPage.createNewQuestion().click()
            adminPage.newQuestionTitle().type(faker.random.word())
            adminPage.setSupportNotes(faker.random.words(3))
            const dropdownSelect = new DropdownSelect()
            dropdownSelect.select(
                cy.getByDataTestid(selectOrganizationDropdown).contains('Organization'),
                faker.random.arrayElement(Object.keys(Organization))
            )
            adminPage.cancelEditButton().click()
            cy.testCacheAndDB(() => {
                goToQuestionnaire()
                adminPage.allQuestionNo().then(questions => {
                    const questionsCountPostCancel = Cypress.$(questions).length - 1
                    expect(questionsCount, 'number of questions before and after cancel edit differ').to.equal(questionsCountPostCancel)
                })
            })
        })
    })

    it('Navigate to a barrier', () => {
        adminPage.adminButton().click()
        adminPage.barrierInSideBar('PS1 Containment').click()
        adminPage.barrierTitleOnTopOfPage().should('have.text', 'Containment')
        adminPage.createNewQuestion().should('be.visible')
    })

    it('Non admin user does not see Admin tab', () => {
        cy.visitProject(getUserWithNoAdminRole())
        adminPage.adminButton().should('not.exist')
    })

    it('Non admin user cannot do GQL mutations to delete question', () => {
        cy.visitProject(getUserWithNoAdminRole())
        activeQuestionTemplates().then(templates => {
            const idOfFirstTemplate = templates[0].id
            cy.gql(DELETE_QUESTION_TEMPLATE, { variables: { questionTemplateId: idOfFirstTemplate } }).then(res => {
                expect(res.body.errors[0].extensions.code, 'error code not found').to.not.equal(undefined)
                const errorCode = res.body.errors[0].extensions.code
                expect(res.body.errors[0].message, 'error message not defined').to.not.equal(undefined)
                const errorMessage = res.body.errors[0].message
                const expectedErrorCode = 'AUTH_NOT_AUTHORIZED'
                const expectedErrorMessage = 'The current user is not authorized to access this resource.'
                expect(errorCode, `error code is not ${expectedErrorCode}`).to.equal(expectedErrorCode)
                expect(errorMessage, `error message is not ${expectedErrorMessage}`).to.equal(expectedErrorMessage)
            })
        })
    })
})

const changeQuestionFields = (questionNo: number, newTitle: string, newSupportNotes: string, organization: string) => {
    adminPage.editQuestionButton(questionNo).click()
    adminPage.questionTitle(questionNo).replace(newTitle)
    adminPage.setSupportNotes(newSupportNotes)
    adminPage.changeOrganization(organization)
}

const verifyQuestion = (questionNo: number, title: string, organization: string, supportNotes: string) => {
    adminPage.questionTitle(questionNo).should('have.text', title)
    adminPage.organization(questionNo).should('have.text', organization)
    adminPage.question(questionNo).should('contain.text', supportNotes)
}
