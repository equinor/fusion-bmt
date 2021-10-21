export default class FollowUpTabs {
    workshopSummary = () => {
        return cy.get('#fixed-tablist').contains('Workshop Summary')
    }
    actions = () => {
        return cy.get('#fixed-tablist').contains('Actions')
    }
}
