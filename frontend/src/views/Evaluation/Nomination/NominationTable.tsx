import { DataTable, DataTableColumn } from '@equinor/fusion-components'
import React from 'react'

import { Organization, Participant, Role } from '../../../api/models'
import ParticipantCard from './ParticipantCard'

interface DataTableItem {
    organization: Organization
    role: Role
    participant: Participant
}

interface DataTableRowProps {
    item: DataTableItem
    rowIndex: number
}

const DataTableItemRenderer: React.FC<DataTableRowProps> = ({ item }) => (
    <ParticipantCard participant={item.participant} />
)

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
]

interface NominationTableProps {
    participants: Participant[]
}

const NominationTable = ({participants}: NominationTableProps) => {
    const data: DataTableItem[] = participants.map(participant => ({
        participant,
        organization: participant.organization,
        role: participant.role
    }))
    return <>
        <DataTable
            columns={columns}
            data={data}
            isFetching={false}
            rowIdentifier={'organization'}
        />
    </>
}

export default NominationTable
