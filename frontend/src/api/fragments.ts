import { gql } from '@apollo/client'

export const PARTICIPANT_FIELDS_FRAGMENT = gql`
    fragment ParticipantFields on Participant {
        id
        azureUniqueId
        organization
        role
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
    }
`

export const QUESTION_FIELDS_FRAGMENT = gql`
    fragment QuestionFields on Question {
        id
        text
        supportNotes
        barrier
        organization
    }
`

export const ANSWER_FIELDS_FRAGMENT = gql`
    fragment AnswerFields on Answer {
        id
        text
        severity
        progression
    }
`
