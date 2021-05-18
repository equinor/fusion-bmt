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
        createDate
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
        order
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
        onHold
        dueDate
        priority
        completed
        createDate
        description
        assignedTo {
            ...ParticipantFields
        }
    }
    ${PARTICIPANT_FIELDS_FRAGMENT}
`

export const NOTE_FIELDS_FRAGMENT = gql`
    fragment NoteFields on Note {
        id
        text
        createDate
        createdBy {
            ...ParticipantFields
        }
    }
    ${PARTICIPANT_FIELDS_FRAGMENT}
`

export const ACTION_NOTES_FRAGMENT = gql`
    fragment ActionNotes on Action {
        notes {
            ...NoteFields
        }
    }
    ${NOTE_FIELDS_FRAGMENT}
`
