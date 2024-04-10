import React, { useState } from 'react'
import { ApolloError, gql, useMutation } from '@apollo/client'
import { Table } from '@equinor/eds-core-react'
import { Evaluation, Organization, Participant, Progression, Role } from '../../../../api/models'
import { genericErrorMessage, useAzureUniqueId } from '../../../../utils/Variables'
import { roleToString, organizationToString } from '../../../../utils/EnumToString'
import { participantCanDeleteParticipant } from '../../../../utils/RoleBasedAccess'
import { PARTICIPANT_FIELDS_FRAGMENT } from '../../../../api/fragments'
import { useEffectNotOnMount } from '../../../../utils/hooks'
import { useEvaluation } from '../../../../globals/contexts'
import ParticipantCard from '../../../../components/ParticipantCard'
import ErrorBanner from '../../../../components/ErrorBanner'
import ButtonWithSaveIndicator from '../../../../components/ButtonWithSaveIndicator'
import styled from 'styled-components'

const StyledTable = styled(Table)`
    width: 100%;
`

/** Who (Role) can delete users, and when (Progression)
 *
 * Who:
 *  Facilitators and OrganizationLeads
 *
 * When:
 *  Evaluation is at Nomination stage
 */
const disableDelete = (evaluation: Evaluation, azureUniqueId: string) => {
    const loggedInUser = evaluation.participants.find(p => p.azureUniqueId === azureUniqueId)

    if (evaluation.progression !== Progression.Nomination) return true
    
    return !participantCanDeleteParticipant(loggedInUser)
}

interface NominationTableProps {
    participants: Participant[]
}

const NominationTable = ({ participants }: NominationTableProps) => {
    const { deleteParticipant, loading, error } = useDeleteParticipantMutation()
    const [showDeleteUserErrorMessage, setShowDeleteUserErrorMessage] = useState<boolean>(false)
    const disable = disableDelete(useEvaluation(), useAzureUniqueId())

    useEffectNotOnMount(() => {
        if (error !== undefined) {
            setShowDeleteUserErrorMessage(true)
        }
    }, [error])

    return (
        <>
            {showDeleteUserErrorMessage && (
                <ErrorBanner
                    message={'Could not delete user. ' + genericErrorMessage}
                    onClose={() => setShowDeleteUserErrorMessage(false)}
                />
            )}
            <StyledTable>
                <Table.Head>
                    <Table.Row>
                        <Table.Cell>Details</Table.Cell>
                        <Table.Cell>Organization</Table.Cell>
                        <Table.Cell>Role</Table.Cell>
                        <Table.Cell>Delete</Table.Cell>
                    </Table.Row>
                </Table.Head>
                <Table.Body>
                    {participants.map(participant => (
                        <Table.Row key={participant.id}>
                            <Table.Cell>
                                <ParticipantCard participant={participant} />
                                
                            </Table.Cell>
                            <Table.Cell>{organizationToString(participant.organization)}</Table.Cell>
                            <Table.Cell>{roleToString(participant.role)}</Table.Cell>
                            <Table.Cell>
                                <ButtonWithSaveIndicator
                                    onClick={() => {
                                        deleteParticipant(participant.id)
                                    }}
                                    disabled={disable || loading}
                                    isLoading={loading}
                                >
                                    Delete
                                </ButtonWithSaveIndicator>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </StyledTable>
        </>
    )
}

export default NominationTable

interface DeleteParticipantMutationProps {
    deleteParticipant: (id: string) => void
    loading: boolean
    participant: Participant | undefined
    error: ApolloError | undefined
}

const useDeleteParticipantMutation = (): DeleteParticipantMutationProps => {
    const DELETE_PARTICIPANT = gql`
        mutation DeleteParticipant($id: String!) {
            deleteParticipant(participantId: $id) {
                ...ParticipantFields
            }
        }
        ${PARTICIPANT_FIELDS_FRAGMENT}
    `

    const [deleteParticipantApolloFunc, { loading, data, error }] = useMutation(DELETE_PARTICIPANT, {
        update(cache, { data: { deleteParticipant } }) {
            cache.modify({
                fields: {
                    participants(existingParticipantRefs, { readField }) {
                        return existingParticipantRefs.filter((participantRef: any) => {
                            return deleteParticipant.id !== readField('id', participantRef)
                        })
                    },
                },
            })
        },
    })

    const deleteParticipant = (id: string) => {
        deleteParticipantApolloFunc({ variables: { id } })
    }

    return {
        deleteParticipant: deleteParticipant,
        loading,
        participant: data?.deleteParticipant,
        error,
    }
}
