import { getUserWithAdminRole, getUserWithNoAdminRole } from '../support/mock/external/users'
import * as faker from 'faker'
import { Organization, Barrier } from '../../src/api/models'
import { AdminPage, CreateProjectCategory } from '../page_objects/admin_page'
import { DropdownSelect } from '../page_objects/common'
import { activeQuestionTemplates, allProjectCategoryNames, projectCategoryId } from '../support/testsetup/evaluation_seed'
import { ConfirmationDialog } from '../page_objects/common'
import {
    CREATE_QUESTION_TEMPLATE,
    DELETE_QUESTION_TEMPLATE,
    CREATE_PROJECT_CATEGORY,
    DELETE_PROJECT_CATEGORY,
} from '../support/testsetup/gql'
import { organizationToString } from '../../src/utils/EnumToString'
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
            const questionNo = getRandomQuestionNo(questions, Cypress.$(questions).length - 1)
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
            const questionNo = getRandomQuestionNo(questions, Cypress.$(questions).length - 1)
            adminPage.organization(questionNo).then(t => {
                let currentOrg = Cypress.$(t).text()
                let newOrganization = faker.random.arrayElement(Object.keys(Organization).filter(t => t !== currentOrg))
                adminPage.questionTitleByNo(questionNo).then(title => {
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
                    adminPage.questionTitleByNo(createdQuestionNo).should('have.text', title)
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

    it('Delete question template, verify question template was deleted', () => {
        projectCategoryId('CircleField').then(projectCatId => {
            const questionTitle = faker.lorem.words(2)
            createNewQuestionTemplate(Barrier.Gm, Organization.All, questionTitle, faker.lorem.words(3), [projectCatId])
            goToQuestionnaire()
            adminPage.questionNoByTitle(questionTitle).then(qNo => {
                const questionNo = parseInt(Cypress.$(qNo).text())
                activeQuestionTemplates().then(activeTemplatesPreDelete => {
                    adminPage.deleteQuestionButton(questionNo).click()
                    new ConfirmationDialog().yesButton().click()
                    cy.contains(questionTitle).should('not.exist')
                    goToQuestionnaire()
                    activeQuestionTemplates().then(activeTemplatePostDelete => {
                        expect(activeTemplatesPreDelete.length, ' question template not deleted').to.equal(
                            activeTemplatePostDelete.length + 1
                        )
                    })
                    cy.contains(questionTitle).should('not.exist')
                })
            })
        })
    })

    const testdata = [{ categoryToCopyFrom: 'SquareField' }, { categoryToCopyFrom: undefined }]
    testdata.forEach(t => {
        it(`Add project category ${
            t.categoryToCopyFrom !== undefined ? ' and copy from ' + t.categoryToCopyFrom : ' and do not copy'
        }`, () => {
            cy.intercept(/\/graphql/).as('graphql')
            adminPage.addProjectCategoryButton().click()
            const newCategoryName: string = 'NewCat' + faker.lorem.word()
            const projectCategory = new CreateProjectCategory()
            projectCategory.nameTextField().type(newCategoryName)
            const dropdown = new DropdownSelect()
            if (t.categoryToCopyFrom !== undefined) {
                dropdown.select(projectCategory.dropdownField(), t.categoryToCopyFrom)
            }
            projectCategory.save().click()
            cy.wait('@graphql')
            activeQuestionTemplates(newCategoryName).then(questionTemplates => {
                dropdown.select(adminPage.selectProjectCategoryDropdown(), newCategoryName)
                if (t.categoryToCopyFrom !== undefined) {
                    activeQuestionTemplates(t.categoryToCopyFrom).then(questionTemplatesSrc => {
                        expect(
                            questionTemplates.length,
                            ' number of questions in new category retrieved by GQL matches category copied from '
                        ).to.equal(questionTemplatesSrc.length)
                    })
                    adminPage.allQuestionNo().then(visibleQuestionTemplates => {
                        const length = visibleQuestionTemplates.toArray().length
                        dropdown.select(adminPage.selectProjectCategoryDropdown(), t.categoryToCopyFrom)
                        adminPage.allQuestionNo().then(visibleQuestionTemplatesSrc => {
                            expect(length, ' number of questions in new category visible in GUI matches category copied from ').to.equal(
                                visibleQuestionTemplatesSrc.length
                            )
                        })
                    })
                } else {
                    expect(questionTemplates.length, ' no questions were added to newly created category').to.equal(0)
                    cy.contains('Nothing here yet.')
                    cy.contains(
                        'Add a new question or select "All project categories" to find questions that can be assigned to your new category.'
                    )
                }
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
                const errorCode = res.body.errors?.[0].extensions?.code
                const errorMessage = res.body.errors?.[0].message
                const expectedErrorCode = 'AUTH_NOT_AUTHORIZED'
                const expectedErrorMessage = 'The current user is not authorized to access this resource.'
                expect(errorCode, `error code is ${expectedErrorCode}`).to.equal(expectedErrorCode)
                expect(errorMessage, `error message is ${expectedErrorMessage}`).to.equal(expectedErrorMessage)
            })
        })
    })

    it('Select question template by category, delete project category & verify project category is no longer present', () => {
        allProjectCategoryNames().then(projectCatArray => {
            const newCategoryName = 'TheNewCategory' + faker.lorem.word()
            createNewProjectCategory(newCategoryName).then(categoryId => {
                const questionTitle = faker.lorem.words(2)
                const organization = faker.random.arrayElement(Object.values(Organization))
                const supportNotes = faker.lorem.words(3)
                createNewQuestionTemplate(Barrier.Gm, organization, questionTitle, supportNotes, [categoryId])
                goToQuestionnaire()
                const dropdownSelect = new DropdownSelect()
                dropdownSelect.select(adminPage.selectProjectCategoryDropdown(), newCategoryName)
                cy.contains(newCategoryName).should('be.visible')
                adminPage.allQuestionNo().then(questions => {
                    expect(questions.length, ' number of questions should be ').to.equal(1)
                })
                adminPage.questionNoByTitle(questionTitle).then(qNo => {
                    const questionNo = parseInt(Cypress.$(qNo).text())
                    verifyQuestion(questionNo, questionTitle, organizationToString(organization), supportNotes)
                    adminPage.deleteProjectCategory().click()
                    new ConfirmationDialog().yesButton().click()
                    adminPage.selectProjectCategoryDropdown().click()
                    cy.contains(newCategoryName).should('not.exist')
                    dropdownSelect.assertSelectValues(projectCatArray.concat('All project categories'))
                    goToQuestionnaire()
                    adminPage.selectProjectCategoryDropdown().click()
                    cy.contains(newCategoryName).should('not.exist')
                })
            })
        })
    })

    it('Change order on question templates, question templates can be moved up and down', () => {
        adminPage.allQuestionNo().then(questionTemplates => {
            const length = Cypress.$(questionTemplates).length
            adminPage.questionTemplateMenu().click()
            adminPage.reorderQuestions().click()
            adminPage.moveQuestionUp(getQuestionNo(questionTemplates, 0)).should('be.disabled')
            adminPage.moveQuestionDown(getQuestionNo(questionTemplates, length - 1)).should('be.disabled')
            adminPage.questionTitleByNo(getQuestionNo(questionTemplates, 0)).then(titleElement => {
                const t = Cypress.$(titleElement).text()
                adminPage.moveQuestionDown(getQuestionNo(questionTemplates, 0)).click()
                adminPage.questionTitleByNo(getQuestionNo(questionTemplates, 1)).should('have.text', t)
            })
            adminPage.questionTitleByNo(getQuestionNo(questionTemplates, length - 1)).then(titleElement => {
                const t = Cypress.$(titleElement).text()
                adminPage.moveQuestionUp(getQuestionNo(questionTemplates, length - 1)).click()
                adminPage.questionTitleByNo(getQuestionNo(questionTemplates, length - 2)).should('have.text', t)
            })
        })
    })

    it('Add & delete project category on question templates', () => {
        const newCategoryName = 'CatToAssign' + faker.lorem.word()
        createNewProjectCategory(newCategoryName).then(categoryId => {
            goToQuestionnaire()
            const questionTitle = faker.lorem.words(2)
            const organization = faker.random.arrayElement(Object.values(Organization))
            const supportNotes = faker.lorem.words(3)
            selectProjectCategoryOnTemplate(1, newCategoryName)
            adminPage.projectCategoryLabel(newCategoryName).should('be.visible')
            closeOutSelectProjectCategoryView()
            adminPage.projectCategoryLabel(newCategoryName).should('be.visible')
            selectProjectCategoryOnTemplate(1, newCategoryName)
            adminPage.projectCategoryLabel(newCategoryName).should('not.exist')
            closeOutSelectProjectCategoryView()
            adminPage.projectCategoryLabel(newCategoryName).should('not.exist')
            deleteProjectCategory(categoryId)
        })

        const selectProjectCategoryOnTemplate = (temoplateNo: number, projectCategory: string) => {
            adminPage.questionTemplateMenu().click()
            adminPage.addQuestionTemplateToProjectCatOrCloseView().click()
            adminPage.projectCategorySelectorButton(temoplateNo).click()
            adminPage.toggleProjectCategoryOnQuestionTemplateSelectBox(temoplateNo, projectCategory).click()
        }

        const closeOutSelectProjectCategoryView = () => {
            adminPage.questionTemplateMenu().click()
            adminPage.addQuestionTemplateToProjectCatOrCloseView().click()
        }
    })
})

const changeQuestionFields = (questionNo: number, newTitle: string, newSupportNotes: string, organization: string) => {
    adminPage.editQuestionButton(questionNo).click()
    adminPage.questionTitleByNo(questionNo).replace(newTitle)
    adminPage.setSupportNotes(newSupportNotes)
    adminPage.changeOrganization(organization)
}

const verifyQuestion = (questionNo: number, title: string, organization: string, supportNotes: string) => {
    adminPage.questionTitleByNo(questionNo).should('have.text', title)
    adminPage.organization(questionNo).should('have.text', organization)
    adminPage.question(questionNo).should('contain.text', supportNotes)
}

const getRandomQuestionNo = (questions: any, questionsCount: number): number => {
    return parseInt(questions.toArray()[faker.datatype.number({ min: 0, max: questionsCount })].innerText.replace('.', ''))
}

const getQuestionNo = (questions: any, questionNo: number): number => {
    return parseInt(questions.toArray()[questionNo as number].innerText.replace('.', ''))
}

const createNewQuestionTemplate = (
    barrier: Barrier,
    organization: Organization,
    text: string,
    supportNotes: string,
    projectCategoryIds: [string]
) => {
    cy.gql(CREATE_QUESTION_TEMPLATE, { variables: { barrier, organization, text, supportNotes, projectCategoryIds } })
}

const createNewProjectCategory = (categoryName: string) => {
    return cy.gql(CREATE_PROJECT_CATEGORY, { variables: { name: categoryName } }).then(res => {
        const id = res.body.data.createProjectCategory.id
        return id
    })
}

const deleteProjectCategory = (id: string) => {
    return cy.gql(DELETE_PROJECT_CATEGORY, { variables: { projectCategoryId: id } }).then(res => {
        const id = res.body.data.deleteProjectCategory.id
        return id
    })
}
