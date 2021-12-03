import { DataTable, DataTableColumn } from '@equinor/fusion-components'
import React, { useState } from 'react'
import { ApolloError, gql, useMutation } from '@apollo/client'

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

interface DataTableItem {
    organization: Organization
    role: Role
    participant: Participant
    rowIdentifier: string
    disableDelete: boolean
    deleteParticipant: (id: string) => void
    isDeletingParticipant: boolean
}

interface DataTableRowProps {
    item: DataTableItem
    rowIndex: number
}

const ParticipantRenderer: React.FC<DataTableRowProps> = ({ item }) => <ParticipantCard participant={item.participant} />

const DeleteColumnItemRenderer: React.FC<DataTableRowProps> = ({ item }) => {
    const azureUniqueId: string = useAzureUniqueId()

    if (item.participant.azureUniqueId === azureUniqueId) return <></>

    return (
        <div data-testid={'delete_button_' + item.participant.azureUniqueId}>
            <ButtonWithSaveIndicator
                onClick={() => {
                    item.deleteParticipant(item.participant.id)
                }}
                disabled={item.disableDelete || item.isDeletingParticipant}
                isLoading={item.isDeletingParticipant}
            >
                Delete
            </ButtonWithSaveIndicator>
        </div>
    )
}

const RoleRenderer: React.FC<DataTableRowProps> = ({ item }) => <>{roleToString(item.role)}</>

const OrganizationRenderer: React.FC<DataTableRowProps> = ({ item }) => <>{organizationToString(item.organization)}</>

const columns: DataTableColumn<DataTableItem>[] = [
    {
        key: 'person',
        accessor: 'participant',
        label: 'Details',
        sortable: false,
        component: ParticipantRenderer,
    },
    {
        key: 'role',
        accessor: 'role',
        label: 'Role',
        sortable: false,
        component: RoleRenderer,
    },
    {
        key: 'organization',
        accessor: 'organization',
        label: 'Organization',
        component: OrganizationRenderer,
        sortable: false,
    },
    {
        key: 'delete',
        accessor: 'participant',
        label: '',
        component: DeleteColumnItemRenderer,
        priority: 3,
    },
]

/** Who (Role) can delete users, and when (Progression)
 *
 * Who:
 *  Facilitators and OrganizationLeads
 *
 * When:
 *  Evaluation is at Nomination stage
 */
const disableDelete = (evaluation: Evaluation, azureUniqueId: string) => {
    if (evaluation.progression !== Progression.Nomination) {
        return true
    }

    const loggedInUser = evaluation.participants.find(p => p.azureUniqueId === azureUniqueId)

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

    const data: DataTableItem[] = participants.map(participant => ({
        participant,
        organization: participant.organization,
        role: participant.role,
        rowIdentifier: participant.id,
        disableDelete: disable,
        deleteParticipant: deleteParticipant,
        isDeletingParticipant: loading,
    }))
    return (
        <>
            {showDeleteUserErrorMessage && (
                <ErrorBanner
                    message={'Could not delete user. ' + genericErrorMessage}
                    onClose={() => setShowDeleteUserErrorMessage(false)}
                />
            )}
            <DataTable columns={columns} data={data} isFetching={false} rowIdentifier={'rowIdentifier'} />
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
