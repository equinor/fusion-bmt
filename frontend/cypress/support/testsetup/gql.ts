import { getToken } from '../commands/auth'

const API_URL = Cypress.env('API_URL') || 'http://localhost:5000'
Cypress.Commands.add('gql', (query: string, variables: {}) => {
    return cy.request({
        url: `${API_URL}/graphql` || 'http://localhost:5000/graphql',
        method: 'POST',
        body: { query, ...variables },
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    })
})

declare global {
    namespace Cypress {
        interface Chainable {
            gql(query: string, variables: {}): Cypress.Chainable
        }
    }
}

export const DELETE_QUESTION_TEMPLATE = `
        mutation DeleteQuestionTemplate($questionTemplateId: String!) {
            deleteQuestionTemplate(questionTemplateId: $questionTemplateId) {
                id
            }
        }
    `
export const CREATE_PROJECT_CATEGORY = `
mutation CreateProjectCategory($name: String!) {
    createProjectCategory(name: $name) {
        id
        name
    }
}
`

export const CREATE_QUESTION_TEMPLATE = `
mutation CreateQuestionTemplate(
    $barrier: Barrier!
    $organization: Organization!
    $text: String!
    $supportNotes: String!
    $projectCategoryIds: [String]
) {
    createQuestionTemplate(
        barrier: $barrier
        organization: $organization
        text: $text
        supportNotes: $supportNotes
        projectCategoryIds: $projectCategoryIds
    ) {
        id
    }
}`

export const GET_QUESTION_TEMPLATES = `
    query() {
        questionTemplates {id, projectCategories {name}, status}
    }
`

export const GET_EVALUATIONS = `
    query() {
        evaluations {id, name, questions {id, text }}
    }
`

export const GET_PROJECT = `
    query($fusionProjectId: String!) {
        project(fusionProjectID: $fusionProjectId) {
            id
        }
    }
`

export const GET_PROJECT_CATEGORY = `
    query($name: String!) {
        projectCategory(where: { name: { eq: $name } }) {
            id
        }
    }
`

export const ADD_EVALUATION = `
    mutation CreateEvaluation(
        $name: String!,
        $projectId: String!,
        $projectCategoryId: String
    ) {
        createEvaluation(
            name: $name,
            projectId: $projectId,
            projectCategoryId: $projectCategoryId
        ) {
            id
            questions {
                id,
                order,
                barrier,
                organization
            }
            participants {
                id
            }
        }
    }
`

export const PROGRESS_EVALUATION = `
    mutation ProgressEvaluation(
        $evaluationId: String!,
        $newProgression: Progression!
    ) {
        progressEvaluation(
            evaluationId: $evaluationId,
            newProgression: $newProgression
        ) {
            id
        }
    }
`

export const PROGRESS_PARTICIPANT = `
    mutation ProgressParticipant(
        $evaluationId: String!,
        $newProgression: Progression!
    ) {
        progressParticipant(
            evaluationId: $evaluationId,
            newProgression: $newProgression
        ) {
            id
        }
    }
`

export const SET_ANSWER = `
    mutation SetAnswer(
        $questionId: String,
        $severity: Severity!,
        $text: String,
        $progression: Progression!
    ) {
        setAnswer(
            questionId: $questionId,
            severity: $severity,
            text: $text,
            progression: $progression
        ) {
            id
        }
    }
`

export const ADD_PARTICIPANT = `
    mutation CreateParticipant(
        $azureUniqueId: String!,
        $evaluationId: String!,
        $organization: Organization!,
        $role: Role!
    ) {
        createParticipant(
            azureUniqueId: $azureUniqueId,
            evaluationId: $evaluationId,
            organization: $organization,
            role: $role
        ) {
            id
        }
    }
`
export const CREATE_ACTION = `
    mutation CreateAction(
        $questionId: String
        $assignedToId: String
        $description: String
        $dueDate: DateTime!
        $priority: Priority!
        $title: String
    ) {
        createAction(
            questionId: $questionId
            assignedToId: $assignedToId
            description: $description
            dueDate: $dueDate
            priority: $priority
            title: $title
        ) {
            id
        }
    }
`

export const EDIT_ACTION = `
    mutation EditAction(
        $actionId: String
        $assignedToId: String
        $description: String
        $dueDate: DateTime!
        $priority: Priority!
        $title: String
        $completed: Boolean!
        $onHold: Boolean!
    ) {
        editAction(
            actionId: $actionId
            assignedToId: $assignedToId
            description: $description
            dueDate: $dueDate
            priority: $priority
            title: $title
            completed: $completed
            onHold: $onHold
        ) {
            id
        }
    }
`

export const DELETE_ACTION = `
mutation DeleteAction($actionId: String) {
    deleteAction(actionId: $actionId) {
        id
    }
}
`

export const CREATE_NOTE = `
    mutation CreateNote($text: String, $actionId: String) {
        createNote(text: $text, actionId: $actionId) {
            id
        }
    }
`

export const SET_SUMMARY = `
    mutation SetSummary($evaluationId: String, $summary: String) {
        setSummary(evaluationId: $evaluationId, summary: $summary) {
            id
        }
    }
`
