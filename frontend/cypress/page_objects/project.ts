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
            return cy.get('[data-testid=create_evaluation_dialog_create_button]')
        }

        previousEvaluation = () => {
            return cy.contains('Previous evaluation').parent()
        }

        projectCategoryTextField = () => {
            return cy.contains('Project Category').parent()
        }

        createEvaluation = (name: string, projectCategory: string, previousEvaluation?: string) => {
            this.nameTextField().type(name)
            this.projectCategoryTextField().type(`${projectCategory}{enter}`)

            if (previousEvaluation) {
                this.previousEvaluation().click().type(`${previousEvaluation}{enter}`)
            }

            this.createButton().click()
        }
    }
}
