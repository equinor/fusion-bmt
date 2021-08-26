import { DataTable, DataTableColumn, Button } from '@equinor/fusion-components'
import React from 'react'

import { Evaluation, Organization, Participant, Progression, Role } from '../../../api/models'
import { useAzureUniqueId } from '../../../utils/Variables'
import ParticipantCard from '../../../components/ParticipantCard'
import { ProgressionStatus } from '../../../utils/ProgressionStatus'
import { useDeleteParticipantMutation } from './NominationGQL'
import { roleToString, organizationToString } from '../../../utils/EnumToString'
import { useEvaluation } from '../../../globals/contexts'
import { participantCanDeleteParticipant } from '../../../utils/RoleBasedAccess'

interface DataTableItem {
    organization: Organization
    role: Role
    participant: Participant
    rowIdentifier: string
    disableDelete: boolean
}

interface DataTableRowProps {
    item: DataTableItem
    rowIndex: number
}

const ParticipantRenderer: React.FC<DataTableRowProps> = ({ item }) => <ParticipantCard participant={item.participant} />

const DeleteColumnItemRenderer: React.FC<DataTableRowProps> = ({ item }) => {
    const azureUniqueId: string = useAzureUniqueId()

    if (item.participant.azureUniqueId === azureUniqueId) return <></>

    const { deleteParticipant, loading } = useDeleteParticipantMutation()

    return (
        <div data-testid={'delete_button_' + item.participant.azureUniqueId}>
            <Button
                onClick={() => {
                    deleteParticipant(item.participant.id)
                }}
                disabled={item.disableDelete || loading}
            >
                Delete
            </Button>
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

    if (!loggedInUser) {
        return true
    }

    return !participantCanDeleteParticipant(loggedInUser.role)
}

interface NominationTableProps {
    participants: Participant[]
}

const NominationTable = ({ participants }: NominationTableProps) => {
    const disable = disableDelete(useEvaluation(), useAzureUniqueId())

    const data: DataTableItem[] = participants.map(participant => ({
        participant,
        organization: participant.organization,
        role: participant.role,
        rowIdentifier: participant.id,
        disableDelete: disable,
    }))
    return (
        <>
            <DataTable columns={columns} data={data} isFetching={false} rowIdentifier={'rowIdentifier'} />
        </>
    )
}

export default NominationTable
