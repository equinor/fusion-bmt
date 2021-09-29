export class WorkshopAssessmentTabs {
    workshopSummary = () => {
        return cy.getByDataTestid('workshop_assessment_tablist').contains('Workshop Summary')
    }
}

export class WorkshopSummary {
    body = () => {
        return cy.getByDataTestid('workshop_summary_div')
    }

    assertEditorDisabler = (boxStatus: 'hidden' | 'visible') => {
        if (boxStatus === 'visible') {
            this.body().within(() => {
                cy.getByDataTestid('disabler_box_div').should('have.css', 'display', 'block')
            })
        } else if (boxStatus === 'hidden') {
            this.body().within(() => {
                cy.getByDataTestid('disabler_box_div').should('have.css', 'display', 'none')
            })
        }
    }
}
