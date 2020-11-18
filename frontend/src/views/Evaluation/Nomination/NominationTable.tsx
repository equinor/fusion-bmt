import { DataTable, DataTableColumn, Button } from '@equinor/fusion-components'
import React from 'react'

import { Organization, Participant, Role } from '../../../api/models'
import ParticipantCard from './ParticipantCard'
import { ProgressionStatus } from '../../../utils/ProgressionStatus'
import { useDeleteParticipantMutation } from './NominationGQL'

interface DataTableItem {
    organization: Organization
    role: Role
    participant: Participant
    progressionStatus: ProgressionStatus
    rowIdentifier: string
}

interface DataTableRowProps {
    item: DataTableItem
    rowIndex: number
}

const DataTableItemRenderer: React.FC<DataTableRowProps> = ({ item }) => (
    <ParticipantCard participant={item.participant} />
)

const DeleteColumnItemRenderer: React.FC<DataTableRowProps> = ({ item }) => {
    if (item.role === Role.Facilitator) return <></>

    const {deleteParticipant, loading} = useDeleteParticipantMutation()

    return (
        <Button onClick={() => {
            deleteParticipant(item.participant.id)
        }}
        disabled={item.progressionStatus !== ProgressionStatus.InProgress || loading}
        >Delete</Button>
    )
}

const columns: DataTableColumn<DataTableItem>[] = [
    {
        key: 'person',
        accessor: 'participant',
        label: 'Details',
        sortable: false,
        component: DataTableItemRenderer
    },
    {
        key: 'role',
        accessor: 'role',
        label: 'Role',
        sortable: false,
    },
    {
        key: 'organization',
        accessor: 'organization',
        label: 'Organization',
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

interface NominationTableProps {
    participants: Participant[]
    currentProgressionStatus: ProgressionStatus
}

const NominationTable = ({participants, currentProgressionStatus}: NominationTableProps) => {
    const data: DataTableItem[] = participants.map(participant => ({
        participant,
        organization: participant.organization,
        role: participant.role,
        progressionStatus: currentProgressionStatus,
        rowIdentifier: participant.id
    }))
    return <>
        <DataTable
            columns={columns}
            data={data}
            isFetching={false}
            rowIdentifier={'rowIdentifier'}
        />
    </>
}

export default NominationTable
