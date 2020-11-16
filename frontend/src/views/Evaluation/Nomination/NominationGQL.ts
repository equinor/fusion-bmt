import { ApolloError, gql, useMutation, useQuery } from '@apollo/client'
import { PARTICIPANT_FRAGMENT } from '../../../api/fragments'
import { Organization, Participant, Role } from "../../../api/models"

interface ParticipantQueryProps {
    loading: boolean
    participants: Participant[] | undefined
    error: ApolloError | undefined
}

export const useParticipantsQuery = (evaluationId: string): ParticipantQueryProps => {
    const GET_PARTICIPANTS = gql`
        query {
            participants(where:{evaluation: {id: {eq: "${evaluationId}"}}}) {
                ...Fields
            }
        }
        ${PARTICIPANT_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{participants: Participant[]}>(
        GET_PARTICIPANTS
    )

    return {
        loading,
        participants: data?.participants,
        error
    }
}

interface CreateParticipantMutationProps {
    createParticipant: (azureUniqueId: string, evaluationId: string, organization: Organization, role: Role) => void
    loading: boolean
    participant: Participant | undefined
    error: ApolloError | undefined
}

export const useCreateParticipantMutation = (): CreateParticipantMutationProps => {
    const CREATE_PARTICIPANT = gql`
        mutation CreateParticipant($azureUniqueId: String!, $evaluationId: String!, $organization: Organization!, $role: Role!){
            createParticipant(
                azureUniqueId: $azureUniqueId
                evaluationId: $evaluationId
                organization: $organization
                role: $role
            ){
                ...Fields
            }
        }
        ${PARTICIPANT_FRAGMENT}
    `

    const [createParticipantApolloFunc, { loading, data, error }] = useMutation(
        CREATE_PARTICIPANT, {
            update(cache, { data: { createParticipant } }) {
                cache.modify({
                    fields: {
                        participants(existingParticipants = []) {
                            const newParticipantRef = cache.writeFragment({
                                id: createParticipant.id,
                                data: createParticipant,
                                fragment: PARTICIPANT_FRAGMENT
                            })
                            return [...existingParticipants, newParticipantRef]
                        }
                    }
                })
            }
        }
    )

    const createParticipant = (azureUniqueId: string, evaluationId: string, organization: Organization, role: Role) => {
        createParticipantApolloFunc({ variables: { azureUniqueId, evaluationId, organization, role} })
    }

    return {
        createParticipant: createParticipant,
        loading,
        participant: data?.createParticipant,
        error
    }
}
