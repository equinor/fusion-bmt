import React, { useMemo, useState } from 'react'
import { tokens } from '@equinor/eds-tokens'
import styled from 'styled-components'
import { PersonDetails } from '@equinor/fusion'
import { Icon, Table, Typography } from '@equinor/eds-core-react'
import { Action, Barrier, Organization } from '../../api/models'
import { sort, SortDirection, sortPriority } from '../../utils/sort'
import PriorityIndicator from '../Action/PriorityIndicator'
import { barrierToString, organizationToString } from '../../utils/EnumToString'

const { Body, Row, Cell, Head } = Table

type ActionWithAdditionalInfo = {
    action: Action
    barrier: Barrier
    organization: Organization
}

type Column = {
    name: string
    accessor: keyof Action | 'barrier' | 'organization'
}

const actionTableColumns: Column[] = [
    { name: 'Title', accessor: 'title' },
    { name: 'Barrier', accessor: 'barrier' },
    { name: 'Organization', accessor: 'organization' },
    { name: 'Completed', accessor: 'completed' },
    { name: 'Priority', accessor: 'priority' },
    { name: 'Assigned to', accessor: 'assignedTo' },
    { name: 'Due date', accessor: 'dueDate' },
]

const PriorityDisplay = styled.div`
    display: flex;
    flex-direction: row;
`

interface IconProps {
    name: string
    isSelected: boolean
}

const SortIcon = styled(Icon)<IconProps>`
    visibility: ${({ isSelected }) => (isSelected ? 'visible' : 'hidden')};
`

interface Props {
    actionsWithAdditionalInfo: ActionWithAdditionalInfo[]
    personDetailsList: PersonDetails[]
    onClickAction: (action: Action) => void
}

const ActionTable = ({ onClickAction, actionsWithAdditionalInfo, personDetailsList }: Props) => {
    const [sortDirection, setSortDirection] = useState<SortDirection>('none')
    const [columnToSortBy, setColumnToSortBy] = useState<Column>()

    const assignedPersonDetails = (action: Action): PersonDetails | undefined => {
        const assignedToId = action.assignedTo?.azureUniqueId
        return personDetailsList.find((p: PersonDetails) => p.azureUniqueId === assignedToId)
    }

    const sortedActions = useMemo(() => {
        if (columnToSortBy) {
            return [...actionsWithAdditionalInfo].sort((a: ActionWithAdditionalInfo, b: ActionWithAdditionalInfo) => {
                const { accessor } = columnToSortBy

                switch (accessor) {
                    case 'assignedTo': {
                        const assignedToA = assignedPersonDetails(a.action)
                        const assignedToB = assignedPersonDetails(b.action)

                        return assignedToA && assignedToB ? sort(assignedToA.name, assignedToB.name, sortDirection) : 0
                    }
                    case 'priority':
                        return sortPriority(a.action.priority, b.action.priority, sortDirection)
                    case 'barrier':
                        return sort(a.barrier, b.barrier, sortDirection)
                    case 'organization':
                        return sort(a.organization, b.organization, sortDirection)
                    default:
                        return sort(a.action[accessor], b.action[accessor], sortDirection)
                }
            })
        }
        return actionsWithAdditionalInfo
    }, [columnToSortBy, sortDirection, actionsWithAdditionalInfo])

    const setSortOn = (selectedColumn: Column) => {
        if (columnToSortBy && selectedColumn.name === columnToSortBy.name) {
            if (sortDirection === 'ascending') {
                setSortDirection('descending')
            } else {
                setSortDirection('none')
                setColumnToSortBy(undefined)
            }
        } else {
            setColumnToSortBy(selectedColumn)
            setSortDirection('ascending')
        }
    }

    return (
        <>
            <Table style={{ width: '100%' }}>
                <Head>
                    <Row>
                        {actionTableColumns.map(column => {
                            const isSelected = columnToSortBy ? column.name === columnToSortBy.name : false
                            return (
                                <Cell
                                    key={column.name}
                                    onClick={() => {
                                        setSortOn(column)
                                    }}
                                    sort={isSelected ? sortDirection : 'none'}
                                >
                                    {column.name}
                                    <SortIcon
                                        name={sortDirection === 'descending' ? 'chevron_up' : 'chevron_down'}
                                        isSelected={isSelected}
                                    />
                                </Cell>
                            )
                        })}
                    </Row>
                </Head>
                <Body>
                    {sortedActions.map(({ action, barrier, organization }) => {
                        const priority = action.priority
                        const priorityFormatted = priority.substring(0, 1) + priority.substring(1).toLowerCase()
                        const assignedTo = assignedPersonDetails(action)

                        return (
                            <Row key={action.id}>
                                <Cell
                                    onClick={() => onClickAction(action)}
                                    style={{ color: tokens.colors.interactive.primary__resting.rgba, cursor: 'pointer' }}
                                >
                                    {action.title}
                                </Cell>
                                <Cell>{barrierToString(barrier)}</Cell>
                                <Cell>{organizationToString(organization)}</Cell>
                                <Cell>{action.completed ? 'Yes' : 'No'}</Cell>
                                <Cell>
                                    <PriorityDisplay>
                                        <PriorityIndicator priority={action.priority} />
                                        <Typography style={{ marginLeft: '10px' }}>{priorityFormatted}</Typography>
                                    </PriorityDisplay>
                                </Cell>
                                <Cell>{assignedTo ? assignedTo.name : 'Unknown User'}</Cell>
                                <Cell>{new Date(action.dueDate).toLocaleDateString()}</Cell>
                            </Row>
                        )
                    })}
                </Body>
            </Table>
        </>
    )
}

export default ActionTable
