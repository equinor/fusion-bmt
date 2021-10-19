import { getUserWithAdminRole, getUserWithNoAdminRole } from '../support/mock/external/users'
import * as faker from 'faker'
import { Organization, Barrier } from '../../src/api/models'
import { AdminPage, CreateProjectCategory } from '../page_objects/admin_page'
import { DropdownSelect } from '../page_objects/common'
import { activeQuestionTemplates, allProjectCategoryNames, projectCategoryId } from '../support/testsetup/evaluation_seed'
import { ConfirmationDialog } from '../page_objects/common'
import { generateRandomString } from '../support/testsetup/testdata'
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
    const goToAdminTab = () => {
        const adminUser = getUserWithAdminRole()
        cy.visitProject(adminUser)
        adminPage.adminButton().click()
        adminPage.adminPageTitle().should('have.text', 'Project configuration: Questionnaire')
    }

    beforeEach(() => {
        goToAdminTab()
    })

    describe('Question templates', () => {
        it('Edit question template - change title, support notes and organization', () => {
            adminPage.allQuestionNo().then(questions => {
                const questionNo = getRandomQuestionNo(questions, Cypress.$(questions).length - 1)
                adminPage.organization(questionNo).then(t => {
                    const currentOrg = Cypress.$(t).text()
                    const newOrganization = faker.random.arrayElement(Object.keys(Organization).filter(t => t !== currentOrg))
                    const newTitle = 'This is the new title' + generateRandomString(10)
                    const newSupportNotes = 'These are the new support notes!!!' + generateRandomString(10)
                    changeQuestionFields(questionNo, newTitle, newSupportNotes, newOrganization)
                    adminPage.saveQuestionButton().click()
                    verifyQuestion(questionNo, newTitle, newOrganization, newSupportNotes)
                })
            })
        })

        it('Cancel Edit question template - changes to title, support notes and organization are not saved and original values visible', () => {
            adminPage.allQuestionNo().then(questions => {
                const questionNo = getRandomQuestionNo(questions, Cypress.$(questions).length - 1)
                adminPage.organization(questionNo).then(t => {
                    let currentOrg = Cypress.$(t).text()
                    let newOrganization = faker.random.arrayElement(Object.keys(Organization).filter(t => t !== currentOrg))
                    adminPage.questionTitleByNo(questionNo).then(title => {
                        let currentTitle = Cypress.$(title).text()
                        adminPage.supportNotes(questionNo).then(supportNotes => {
                            let currentSupportNotes = Cypress.$(supportNotes).text()
                            const newTitle = 'This is the new title' + generateRandomString(10)
                            const newSupportNotes = 'These are the new support notes!!!' + generateRandomString(10)
                            changeQuestionFields(questionNo, newTitle, newSupportNotes, newOrganization)
                            adminPage.cancelEditButton().click()
                            verifyQuestion(questionNo, currentTitle, currentOrg, currentSupportNotes)
                        })
                    })
                })
            })
        })

        it('Add new question template, fill in title, support notes, select organization, verify question template is added', () => {
            adminPage.createNewQuestion().click()
            const title = 'title ' + generateRandomString(10)
            adminPage.newQuestionTitle().type(title)
            const supportNotes = 'supportNotes' + generateRandomString(20)
            adminPage.setSupportNotes(supportNotes)
            const organization = faker.random.arrayElement(Object.keys(Organization))
            const dropdownSelect = new DropdownSelect()
            dropdownSelect.select(cy.getByDataTestid(selectOrganizationDropdown).contains('Organization'), organization)
            adminPage.saveQuestionButton().click()
            cy.testCacheAndDB(() => {
                goToAdminTab()
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

        it('Cancel create new question template, verify question template is not added', () => {
            adminPage.allQuestionNo().then(questions => {
                const questionsCount = Cypress.$(questions).length - 1
                adminPage.createNewQuestion().click()
                adminPage.newQuestionTitle().type(generateRandomString(10))
                adminPage.setSupportNotes(generateRandomString(20))
                const dropdownSelect = new DropdownSelect()
                dropdownSelect.select(
                    cy.getByDataTestid(selectOrganizationDropdown).contains('Organization'),
                    faker.random.arrayElement(Object.keys(Organization))
                )
                adminPage.cancelEditButton().click()
                cy.testCacheAndDB(() => {
                    goToAdminTab()
                    adminPage.allQuestionNo().then(questions => {
                        const questionsCountPostCancel = Cypress.$(questions).length - 1
                        expect(questionsCount, 'number of questions before and after cancel edit differ').to.equal(questionsCountPostCancel)
                    })
                })
            })
        })

        it(`Copy question template, 
            verify question template was copied after source
            and assigned globally highest number of all question templates
            and that title, support notes, organization were copied
            and, if present, project categories were copied`, () => {
            activeQuestionTemplates().then(questionTemplatesPreCopy => {
                const numberOfQuestionTemplatesPreCopy = Cypress.$(questionTemplatesPreCopy).length
                adminPage.allQuestionNo().then(questions => {
                    cy.intercept(/\/graphql/).as('graphql')
                    const beforeCopyLength = Cypress.$(questions).length
                    const questionNumber = faker.datatype.number({ min: 0, max: beforeCopyLength - 1 })
                    const displayedQuestionNo = getQuestionNo(questions, questionNumber)
                    adminPage.copyQuestionButton(displayedQuestionNo).click()
                    adminPage.saveQuestionButton().click()
                    cy.wait('@graphql')
                    adminPage.allQuestionNo().should(questionsAfterCopy => {
                        const afterCopyLength = Cypress.$(questionsAfterCopy).length
                        expect(afterCopyLength, ' total number of questions is one higher').to.equal(beforeCopyLength + 1)
                    })
                    adminPage.allQuestionNo().then(questionsAfterCopy => {
                        expect(
                            getQuestionNo(questionsAfterCopy, questionNumber + 1),
                            ' copied question is placed underneath source and assigned globally highest number of all templates'
                        ).to.equal(numberOfQuestionTemplatesPreCopy + 1)
                        adminPage.questionTitleByNo(displayedQuestionNo).then(title => {
                            const t = Cypress.$(title).text()
                            adminPage.questionTitleByNo(numberOfQuestionTemplatesPreCopy + 1).should('have.text', t)
                        })
                        adminPage.supportNotes(displayedQuestionNo).then(supportNotes => {
                            const sn = Cypress.$(supportNotes).text()
                            adminPage.supportNotes(numberOfQuestionTemplatesPreCopy + 1).should('have.text', sn)
                        })
                        adminPage.organization(displayedQuestionNo).then(organization => {
                            const org = Cypress.$(organization).text()
                            adminPage.organization(numberOfQuestionTemplatesPreCopy + 1).should('have.text', org)
                        })
                        cy.document().then($document => {
                            const documentResult = $document.querySelectorAll(adminPage.projectCategorySelector(displayedQuestionNo))
                            if (documentResult.length) {
                                adminPage.allProjectCategories(displayedQuestionNo).then(cats => {
                                    const categoriesSrc = Cypress.$.makeArray(cats).map(el => el.innerText)
                                    adminPage.allProjectCategories(numberOfQuestionTemplatesPreCopy + 1).then(copyCats => {
                                        const categories = Cypress.$.makeArray(copyCats).map(el => el.innerText)
                                        expect(arrayEquals(categoriesSrc, categories), ' project categories in copy match(es) source').to.be
                                            .true
                                    })
                                })
                            }
                        })
                    })
                })
            })
        })

        const arrayEquals = (a: Array<string>, b: Array<string>) =>
            a.length === b.length && a.every((v: string, i: number) => v === b[parseInt(i.toString())])

        it('Delete question template, verify question template was deleted', () => {
            projectCategoryId('CircleField').then(projectCatId => {
                const questionTitle = faker.lorem.words(2)
                createNewQuestionTemplate(Barrier.Gm, Organization.All, questionTitle, generateRandomString(20), [projectCatId])
                goToAdminTab()
                adminPage.questionNoByTitle(questionTitle).then(qNo => {
                    const questionNo = parseInt(Cypress.$(qNo).text())
                    activeQuestionTemplates().then(activeTemplatesPreDelete => {
                        adminPage.deleteQuestionButton(questionNo).click()
                        new ConfirmationDialog().yesButton().click()
                        cy.contains(questionTitle).should('not.exist')
                        goToAdminTab()
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
                    adminPage.questionTitleByNo(getQuestionNo(questionTemplates, 0)).should('have.text', t)
                })
                adminPage.questionTitleByNo(getQuestionNo(questionTemplates, length - 1)).then(titleElement => {
                    const t = Cypress.$(titleElement).text()
                    adminPage.moveQuestionUp(getQuestionNo(questionTemplates, length - 1)).click()
                    adminPage.questionTitleByNo(getQuestionNo(questionTemplates, length - 1)).should('have.text', t)
                })
            })
        })
    })

    describe('Navigation', () => {
        it('Navigate to a barrier', () => {
            adminPage.adminButton().click()
            adminPage.barrierInSideBar('PS1 Containment').click()
            adminPage.barrierTitleOnTopOfPage().should('have.text', 'Containment')
            adminPage.createNewQuestion().should('be.visible')
        })
    })

    describe('Security', () => {
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

        it('Non admin user does not see Admin tab', () => {
            cy.visitProject(getUserWithNoAdminRole())
            adminPage.adminButton().should('not.exist')
        })
    })

    describe('Project categories', () => {
        it('Select question template by category, delete project category & verify project category is no longer present', () => {
            allProjectCategoryNames().then(projectCatArray => {
                const newCategoryName = 'TheNewCategory' + generateRandomString(10)
                createNewProjectCategory(newCategoryName).then(categoryId => {
                    const questionTitle = generateRandomString(10)
                    const organization = faker.random.arrayElement(Object.values(Organization))
                    const supportNotes = generateRandomString(10)
                    createNewQuestionTemplate(Barrier.Gm, organization, questionTitle, supportNotes, [categoryId])
                    goToAdminTab()
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
                        goToAdminTab()
                        adminPage.selectProjectCategoryDropdown().click()
                        cy.contains(newCategoryName).should('not.exist')
                    })
                })
            })
        })

        it('Add & delete project category on question templates', () => {
            const newCategoryName = 'CatToAssign' + generateRandomString(10)
            createNewProjectCategory(newCategoryName).then(categoryId => {
                goToAdminTab()
                selectProjectCategoryOnTemplate(1, newCategoryName)
                adminPage.projectCategoryLabel(1, newCategoryName).should('be.visible')
                closeOutSelectProjectCategoryView()
                adminPage.projectCategoryLabel(1, newCategoryName).should('be.visible')
                selectProjectCategoryOnTemplate(1, newCategoryName)
                adminPage.projectCategoryLabel(1, newCategoryName).should('not.exist')
                closeOutSelectProjectCategoryView()
                adminPage.projectCategoryLabel(1, newCategoryName).should('not.exist')
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

        const testdata = [{ categoryToCopyFrom: 'CircleField' }, { categoryToCopyFrom: undefined }]
        testdata.forEach(t => {
            it(`Add project category ${
                t.categoryToCopyFrom !== undefined ? ' and copy from ' + t.categoryToCopyFrom : ' and do not copy'
            }`, () => {
                cy.intercept(/\/graphql/).as('graphql')
                adminPage.addProjectCategoryButton().click()
                const newCategoryName: string = 'NewCat' + generateRandomString(10)
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
                                expect(
                                    length,
                                    ' number of questions in new category visible in GUI matches category copied from '
                                ).to.equal(visibleQuestionTemplatesSrc.length)
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
