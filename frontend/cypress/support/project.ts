/**
 * Landing page of a project
 */
export default class ProjectPage {
    createEvaluationButton = () => {
        return cy.contains('Create evaluation')
    }

    static CreateEvaluationDialog = class {
        nameTextField = () => {
            return cy.get('[data-testid=create_evaluation_dialog_name_text_field]')
        }

        createButton = () => {
            /* workaround for 'within' returning outer component instead of inner
             * and inability to place id directly on button
             */
            return cy.get('[data-testid=create_evaluation_dialog_create_button_grid]').then($el => cy.wrap($el).find('button'))
        }
    }
}
