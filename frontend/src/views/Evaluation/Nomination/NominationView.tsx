import React from 'react'
import { ApolloError, gql, useMutation, useQuery } from '@apollo/client'

import { Box } from '@material-ui/core'
import { Button, TextArea } from '@equinor/fusion-components'

import AddNomineeDialog from './AddNomineeDialog'
import { Evaluation, Organization, Participant, Progression, Role } from '../../../api/models'
import NominationTable from './NominationTable'
import { participantCanAddParticipant } from '../../../utils/RoleBasedAccess'
import { apiErrorMessage } from '../../../api/error'
import { PARTICIPANT_FIELDS_FRAGMENT } from '../../../api/fragments'
import { useParticipant } from '../../../globals/contexts'
import { disableProgression } from '../../../utils/disableComponents'

interface NominationViewProps {
    evaluation: Evaluation
    onNextStep: () => void
}

const NominationView = ({ evaluation, onNextStep }: NominationViewProps) => {
    const [panelOpen, setPanelOpen] = React.useState(false)
    const { createParticipant, error: errorMutation } = useCreateParticipantMutation()
    const { loading: loadingQuery, participants, error: errorQuery } = useParticipantsQuery(evaluation.id)
    const participant = useParticipant()
    const viewProgression = Progression.Nomination

    const onNextStepClick = () => {
        onNextStep()
    }

    const onNomineeSelected = (azureUniqueId: string, role: Role, organization: Organization) => {
        createParticipant(azureUniqueId, evaluation.id, organization, role)
    }

    if (loadingQuery) {
        return <>Loading...</>
    }

    if (errorMutation !== undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not add participant')} onChange={() => {}} />
            </div>
        )
    }

    if (errorQuery !== undefined || participants === undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not load participants')} onChange={() => {}} />
            </div>
        )
    }

    return (
        <div style={{ margin: 20 }}>
            <Box display="flex" flexDirection="row">
                <Box flexGrow={1}>
                    <h2 data-testid="evaluation_title">{evaluation.name}</h2>
                </Box>
                <Box>
                    <Button onClick={onNextStepClick} disabled={disableProgression(evaluation, participant, viewProgression)}>
                        Finish Nomination
                    </Button>
                </Box>
            </Box>

            <Button
                onClick={() => {
                    setPanelOpen(true)
                }}
                disabled={!participantCanAddParticipant(participant)}
            >
                Add Person
            </Button>

            <NominationTable
                participants={participants}
            />

            <AddNomineeDialog
                open={panelOpen}
                onCloseClick={() => setPanelOpen(false)}
                onNomineeSelected={onNomineeSelected}
                currentNominees={participants}
            />
        </div>
    )
}

export default NominationView

interface CreateParticipantMutationProps {
    createParticipant: (azureUniqueId: string, evaluationId: string, organization: Organization, role: Role) => void
    loading: boolean
    participant: Participant | undefined
    error: ApolloError | undefined
}

const useCreateParticipantMutation = (): CreateParticipantMutationProps => {
    const CREATE_PARTICIPANT = gql`
        mutation CreateParticipant($azureUniqueId: String!, $evaluationId: String!, $organization: Organization!, $role: Role!) {
            createParticipant(azureUniqueId: $azureUniqueId, evaluationId: $evaluationId, organization: $organization, role: $role) {
                ...ParticipantFields
            }
        }
        ${PARTICIPANT_FIELDS_FRAGMENT}
    `

    const [createParticipantApolloFunc, { loading, data, error }] = useMutation(CREATE_PARTICIPANT, {
        update(cache, { data: { createParticipant } }) {
            cache.modify({
                fields: {
                    participants(existingParticipants = []) {
                        const newParticipantRef = cache.writeFragment({
                            id: createParticipant.id,
                            data: createParticipant,
                            fragment: PARTICIPANT_FIELDS_FRAGMENT,
                        })
                        return [...existingParticipants, newParticipantRef]
                    },
                },
            })
        },
    })

    const createParticipant = (azureUniqueId: string, evaluationId: string, organization: Organization, role: Role) => {
        createParticipantApolloFunc({ variables: { azureUniqueId, evaluationId, organization, role } })
    }

    return {
        createParticipant: createParticipant,
        loading,
        participant: data?.createParticipant,
        error,
    }
}

interface ParticipantQueryProps {
    loading: boolean
    participants: Participant[] | undefined
    error: ApolloError | undefined
}

const useParticipantsQuery = (evaluationId: string): ParticipantQueryProps => {
    const GET_PARTICIPANTS = gql`
        query {
            participants(where:{evaluation: {id: {eq: "${evaluationId}"}}}) {
                ...ParticipantFields
            }
        }
        ${PARTICIPANT_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{ participants: Participant[] }>(GET_PARTICIPANTS)

    return {
        loading,
        participants: data?.participants,
        error,
    }
}

