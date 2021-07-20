export default class ActionsGrid {
    deleteActionButton = (id: string) => {
        return cy.get(`[data-testid=delete_action_button_${id}]`)
    }
}
