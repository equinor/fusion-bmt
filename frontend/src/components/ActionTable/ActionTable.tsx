import React from 'react'
import styled from 'styled-components'

import { tokens } from '@equinor/eds-tokens'
import { Context } from '@equinor/fusion'
import { Table, Typography } from '@equinor/eds-core-react'

import { Action, Barrier, Organization } from '../../api/models'
import SortableTable, { Column } from '../SortableTable'
import { sort, SortDirection, sortPriority } from '../../utils/sort'
import { barrierToString, organizationToString } from '../../utils/EnumToString'
import { getFusionProjectName } from '../../utils/helpers'
import PriorityIndicator from '../Action/PriorityIndicator'
import { PersonDetails } from '@equinor/fusion-react-person'
import { useAppContext } from '../../context/AppContext'

const { Row, Cell } = Table

type ActionWithAdditionalInfo = {
    action: Action
    barrier: Barrier
    organization: Organization
}

const columnOptions: Column[] = [
    { name: 'Title', accessor: 'title', sortable: true },
    { name: 'Project', accessor: 'project', sortable: true },
    { name: 'Evaluation', accessor: 'evaluation', sortable: true },
    { name: 'Barrier', accessor: 'barrier', sortable: true },
    { name: 'Organization', accessor: 'organization', sortable: true },
    { name: 'Completed', accessor: 'completed', sortable: true },
    { name: 'Priority', accessor: 'priority', sortable: true },
    { name: 'Assigned to', accessor: 'assignedTo', sortable: true },
    { name: 'Due date', accessor: 'dueDate', sortable: true },
]

const PriorityDisplay = styled.div`
    display: flex;
    flex-direction: row;
`

interface Props {
    actionsWithAdditionalInfo: ActionWithAdditionalInfo[]
    personDetailsList: PersonDetails[]
    onClickAction: (actionId: string) => void
    showEvaluations?: boolean
    projects?: Context[]
}

const ActionTable = ({ onClickAction, actionsWithAdditionalInfo, personDetailsList, showEvaluations = false, projects }: Props) => {
    const {currentProject} = useAppContext()

    const columns = columnOptions.filter(
        col =>
            (col.name === 'Evaluation' && showEvaluations) ||
            (col.name === 'Project' && !currentProject) ||
            (col.name !== 'Evaluation' && col.name !== 'Project')
    )

    const assignedPersonDetails = (action: Action): PersonDetails | undefined => {
        const assignedToId = action.assignedTo?.azureUniqueId
        return personDetailsList.find((p: PersonDetails) => p?.azureId === assignedToId)
    }

    const sortOnAccessor = (a: ActionWithAdditionalInfo, b: ActionWithAdditionalInfo, accessor: string, sortDirection: SortDirection) => {
        switch (accessor) {
            case 'assignedTo': {
                const assignedToA = assignedPersonDetails(a.action)
                const assignedToB = assignedPersonDetails(b.action)

                return assignedToA && assignedToB ? sort(assignedToA.name!, assignedToB.name!, sortDirection) : 0
            }
            case 'priority':
                return sortPriority(a.action.priority, b.action.priority, sortDirection)
            case 'barrier':
                return sort(barrierToString(a.barrier), barrierToString(b.barrier), sortDirection)
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
                    const projectNameA = getFusionProjectName(projects, a.action?.question?.evaluation?.project?.fusionProjectId)
                    const projectNameB = getFusionProjectName(projects, b.action?.question?.evaluation?.project?.fusionProjectId)
                    return projectNameA && projectNameB ? sort(projectNameA.toLowerCase(), projectNameB.toLowerCase(), sortDirection) : 0
                }
                return 0
            case 'title':
                return sort(a.action.title.toLowerCase(), b.action.title.toLowerCase(), sortDirection)
            case 'completed':
                return sort(a.action.completed, b.action.completed, sortDirection)
            case 'dueDate':
                return sort(a.action.dueDate, b.action.dueDate, sortDirection)
            default:
                return sort(a.action.title.toLowerCase(), b.action.title.toLowerCase(), sortDirection)
        }
    }

    const renderRow = (actionWithAdditionalInfo: ActionWithAdditionalInfo, index: number) => {
        const { action, barrier, organization } = actionWithAdditionalInfo
        const priority = action.priority
        const priorityFormatted = priority.substring(0, 1) + priority.substring(1).toLowerCase()
        const assignedTo = assignedPersonDetails(action)

        return (
            <Row key={index} data-testid={`action-${action.id}`}>
                <Cell
                    onClick={() => onClickAction(action.id)}
                    style={{
                        color: tokens.colors.interactive.primary__resting.rgba,
                        cursor: 'pointer',
                    }}
                >
                    {action.title}
                </Cell>
                {!currentProject && <Cell>{getFusionProjectName(projects, action.question.evaluation.project.fusionProjectId)}</Cell>}
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
    }

    return (
        <SortableTable
            columns={columns}
            data={actionsWithAdditionalInfo}
            sortOnAccessor={sortOnAccessor}
            renderRow={renderRow}
            testId="action-table"
        />
    )
}

export default ActionTable
