import { gql } from '@apollo/client'

export const PARTICIPANT_FIELDS_FRAGMENT = gql`
    fragment Fields on Participant {
        id
        azureUniqueId
        organization
        role
    }
`

export const PARTICIPANTS_ARRAY_FRAGMENT = gql`
    fragment ParticipantsArray on Evaluation {
        participants {
            ...Fields
        }
    }
    ${PARTICIPANT_FIELDS_FRAGMENT}
`

export const EVALUATION_FIELDS_FRAGMENT = gql`
    fragment Fields on Evaluation {
        id
        name
        progression
    }
`
