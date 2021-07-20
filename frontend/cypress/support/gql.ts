import { getToken } from './auth'

const API_URL = Cypress.env('API_URL') || 'http://localhost:5000'

Cypress.Commands.add('gql', (query: string, variables: {}) => {
    return cy.request({
        url: `${API_URL}/graphql`,
        method: 'POST',
        body: {query, ...variables},
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    })
})

declare global {
    namespace Cypress {
        interface Chainable {
            gql(query: string, variables: {}): Cypress.Chainable
        }
    }
}

export const GET_PROJECT = `
    query($fusionProjectId: String!) {
        project(fusionProjectID: $fusionProjectId) {
            id
        }
    }
`

export const ADD_EVALUATION = `
    mutation CreateEvaluation($name: String!, $projectId: String!) {
        createEvaluation(name: $name, projectId: $projectId) {
            id
            questions {
                id,
                order
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
