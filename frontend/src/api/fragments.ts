import { gql } from '@apollo/client'

export const PARTICIPANT_FRAGMENT = gql`
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
    ${PARTICIPANT_FRAGMENT}
`
