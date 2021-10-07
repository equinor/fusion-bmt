export class AdminPage {
    supportNotes = (questionNo: number) => {
        return cy
            .getByDataTestid('question-title-' + questionNo)
            .next()
            .next()
    }

    questionTitleByNo = (questionNo: number) => {
        return cy.getByDataTestid('question-title-' + questionNo)
    }

    questionNoByTitle = (title: string) => {
        return cy.get('[data-testid^=question-title-]').contains(title).parent().prev()
    }

    organization = (questionNo: number) => {
        return cy.getByDataTestid('organization-' + questionNo)
    }

    adminButton = () => {
        return cy.get('button').contains('Admin')
    }

    allQuestionNo = () => {
        return cy.get('[data-testid^=question-number-]')
    }

    question = (questionNo: number) => {
        return cy.get(`[id=question-${questionNo}]`)
    }

    cancelEditButton = () => {
        return cy.getByDataTestid('cancel-edit-question')
    }

    saveQuestionButton = () => {
        return cy.getByDataTestid('save-question-button')
    }

    editQuestionButton = (questionNo: number) => {
        return cy.getByDataTestid('edit-question-' + questionNo)
    }

    deleteQuestionButton = (questionNo: number) => {
        return cy.getByDataTestid('delete-question-' + questionNo)
    }

    setSupportNotes = (supportNotes: string) => {
        return cy
            .getByDataTestid('markdown-editor')
            .shadow()
            .within(() => {
                return cy.get('[id=editor]').replace(supportNotes)
            })
    }

    changeOrganization = (newOrganization: string) => {
        cy.get('label')
            .contains('Organization')
            .next()
            .click()
            .replace(newOrganization + '{enter}')
    }

    barrierInSideBar = (barrier: string) => {
        return cy.get('a').contains(barrier)
    }

    barrierTitleOnTopOfPage = () => {
        return cy.getByDataTestid('barrier-name')
    }

    adminPageTitle = () => {
        return cy.getByDataTestid('admin-page-title')
    }

    createNewQuestion = () => {
        return cy.getByDataTestid('create-new-question-button')
    }

    newQuestionTitle = () => {
        return cy.getByDataTestid('question-title-textfield')
    }
}
