export class AdminPage {
    supportNotes = (questionNo: number) => {
        return cy
            .getByDataTestid('question-title-' + questionNo)
            .next()
            .next()
    }

    questionTitle = (questionNo: number) => {
        return cy.getByDataTestid('question-title-' + questionNo)
    }

    organization = (questionNo: number) => {
        return cy.getByDataTestid('organization-' + questionNo)
    }

    adminButton = () => {
        return cy.get('button').contains('Admin')
    }

    allQuestions = () => {
        return cy.get('[id^=question-]')
    }

    question = (questionNo: number) => {
        return cy.get(`[id=question-${questionNo}]`)
    }

    cancelEditButton = () => {
        return cy.getByDataTestid('cancel-edit-question')
    }

    saveEditButton = () => {
        return cy.getByDataTestid('save-question')
    }

    editQuestionButton = (questionNo: number) => {
        return cy.getByDataTestid('edit-question-' + questionNo)
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
}
