import React, { useMemo, useState } from 'react'
import { tokens } from '@equinor/eds-tokens'
import styled from 'styled-components'
import { PersonDetails, Context } from '@equinor/fusion'
import { Icon, Table, Typography } from '@equinor/eds-core-react'
import { Action, Barrier, Organization } from '../../api/models'
import { sort, SortDirection, sortPriority } from '../../utils/sort'
import PriorityIndicator from '../Action/PriorityIndicator'
import { barrierToString, organizationToString } from '../../utils/EnumToString'
import { getFusionProjectName } from '../helpers'

const { Body, Row, Cell, Head } = Table

type ActionWithAdditionalInfo = {
    action: Action
    barrier: Barrier
    organization: Organization
}

type Column = {
    name: string
    accessor: keyof Action | 'barrier' | 'organization' | 'evaluation' | 'project'
}

const actionTableColumns: Column[] = [
    { name: 'Title', accessor: 'title' },
    { name: 'Project', accessor: 'project' },
    { name: 'Evaluation', accessor: 'evaluation' },
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
    onClickAction: (actionId: string) => void
    showEvaluations?: boolean
    projects?: Context[]
    isFetchingProjects?: boolean
}

const ActionTable = ({
    onClickAction,
    actionsWithAdditionalInfo,
    personDetailsList,
    showEvaluations = false,
    projects,
    isFetchingProjects = false,
}: Props) => {
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
                    case 'evaluation':
                        if (showEvaluations) {
                            return sort(
                                a.action.question.evaluation.name.toLowerCase(),
                                b.action.question.evaluation.name.toLowerCase(),
                                sortDirection
                            )
                        }
                        return 0
                    case 'project':
                        if (projects) {
                            const projectNameA = getFusionProjectName(projects, a.action.question.evaluation.project.fusionProjectId)
                            const projectNameB = getFusionProjectName(projects, b.action.question.evaluation.project.fusionProjectId)
                            return projectNameA && projectNameB ? sort(projectNameA, projectNameB, sortDirection) : 0
                        }
                        return 0
                    case 'title':
                        return sort(a.action.title.toLowerCase(), b.action.title.toLowerCase(), sortDirection)
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
            {!isFetchingProjects && (
                <Table style={{ width: '100%' }} data-testid="action-table">
                    <Head>
                        <Row>
                            {actionTableColumns
                                .filter(
                                    col =>
                                        (col.name === 'Evaluation' && showEvaluations) ||
                                        (col.name === 'Project' && projects) ||
                                        (col.name !== 'Evaluation' && col.name !== 'Project')
                                )
                                .map(column => {
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
                                <Row key={action.id} data-testid={`action-${action.id}`}>
                                    <Cell
                                        onClick={() => onClickAction(action.id)}
                                        style={{ color: tokens.colors.interactive.primary__resting.rgba, cursor: 'pointer' }}
                                    >
                                        {action.title}
                                    </Cell>
                                    {projects && (
                                        <Cell>{getFusionProjectName(projects, action.question.evaluation.project.fusionProjectId)}</Cell>
                                    )}
                                    {showEvaluations && <Cell>{action.question.evaluation.name}</Cell>}
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
            )}
        </>
    )
}

export default ActionTable
