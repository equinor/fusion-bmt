import { gql } from '@apollo/client'

export const PARTICIPANT_FIELDS_FRAGMENT = gql`
    fragment ParticipantFields on Participant {
        id
        azureUniqueId
        organization
        role
        progression
        __typename
    }
`

export const PARTICIPANTS_ARRAY_FRAGMENT = gql`
    fragment ParticipantsArray on Evaluation {
        participants {
            ...ParticipantFields
        }
    }
    ${PARTICIPANT_FIELDS_FRAGMENT}
`

export const EVALUATION_FIELDS_FRAGMENT = gql`
    fragment EvaluationFields on Evaluation {
        id
        name
        progression
        __typename
    }
`

export const ANSWER_FIELDS_FRAGMENT = gql`
    fragment AnswerFields on Answer {
        id
        text
        severity
        progression
        __typename
        answeredBy {
            ...ParticipantFields
        }
    }
    ${PARTICIPANT_FIELDS_FRAGMENT}
`

export const QUESTION_FIELDS_FRAGMENT = gql`
    fragment QuestionFields on Question {
        id
        text
        supportNotes
        barrier
        organization
        __typename
    }
`

export const QUESTION_ANSWERS_FRAGMENT = gql`
    fragment QuestionAnswers on Question {
        answers {
            ...AnswerFields
        }
    }
    ${ANSWER_FIELDS_FRAGMENT}
`

export const ACTION_FIELDS_FRAGMENT = gql`
    fragment ActionFields on Action {
        id
        title
        priority
        dueDate
        createDate
        description
        assignedTo {
            azureUniqueId
        }
    }
`

export const QUESTION_ACTIONS_FRAGMENT = gql`
    fragment QuestionActions on Question {
        actions {
            ...ActionFields
        }
    }
    ${ACTION_FIELDS_FRAGMENT}
`
