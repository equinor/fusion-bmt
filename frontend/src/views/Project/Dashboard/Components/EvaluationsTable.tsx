import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Icon, Table, Tooltip, Typography, Radio } from '@equinor/eds-core-react'
import {
    warning_filled,
    check,
    radio_button_unselected,
    radio_button_selected,
    visibility_off,
    visibility
} from '@equinor/eds-icons'
import { tokens } from '@equinor/eds-tokens'
import { progressionToString } from '../../../../utils/EnumToString'
import { calcProgressionStatus, countProgressionStatus, ProgressionStatus } from '../../../../utils/ProgressionStatus'
import { sort, SortDirection } from '../../../../utils/sort'
import { Evaluation, Progression } from '../../../../api/models'
import { assignAnswerToBarrierQuestions } from '../../../Evaluation/FollowUp/util/helpers'
import { getEvaluationActionsByState } from '../../../../utils/actionUtils'
import Bowtie from '../../../../components/Bowtie/Bowtie'
import SortableTable, { Column } from '../../../../components/SortableTable'
import ProgressStatusIcon from './ProgressStatusIcon'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'
import { useSetEvaluationStatusMutation } from '../../../../views/Evaluation/Nomination/NominationView'
import { Status } from '../../../../api/models'
import { ApolloError, useMutation, gql, ApolloQueryResult } from '@apollo/client'

const { Row, Cell } = Table

const WARNING_COLOR = tokens.colors.interactive.danger__resting.rgba

const Centered = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`

const CellWithBorder = styled(Cell)`
    border-right: 1px solid lightgrey;
`

const CellButton = styled(Icon)`
    cursor: pointer;

    &:hover {
        color: ${tokens.colors.interactive.primary__resting.rgba};
    }
`

interface setProjectIndicatorMutationProps {
    setIndicatorStatus: (projectId: string, evaluationId: string) => Promise<void>
    loading: boolean
    error: ApolloError | undefined
}

const useSetProjectIndicatorMutation = (): setProjectIndicatorMutationProps => {
    const SET_EVALUATION_STATUS_MUTATION = gql`
        mutation SetIndicatorEvaluation($projectId: String!, $evaluationId: String!) {
            setIndicatorEvaluation(projectId: $projectId, evaluationId: $evaluationId) {
                fusionProjectId
                indicatorEvaluationId
            }
        }
    `

    const [setIndicatorApolloFunc, { loading, data, error }] = useMutation(SET_EVALUATION_STATUS_MUTATION)

    const setIndicatorStatus = async (projectId: string, evaluationId: string) => {
        await setIndicatorApolloFunc({ variables: { projectId, evaluationId } })
    }

    return {
        setIndicatorStatus,
        loading,
        error,
    }
}

interface Props {
    evaluations: Evaluation[]
    isInPortfolio?: boolean
    refetchActiveEvaluations?: (() => Promise<ApolloQueryResult<{ evaluations: Evaluation[] }>>) | undefined
}

const EvaluationsTable = ({
    evaluations,
    isInPortfolio,
    refetchActiveEvaluations,
}: Props) => {
    const currentProject = useModuleCurrentContext()
    const { setEvaluationStatus } = useSetEvaluationStatusMutation()
    const { setIndicatorStatus } = useSetProjectIndicatorMutation()

    const [visibleEvaluations, setVisibleEvaluations] = React.useState<Evaluation[]>([])


    useEffect(() => {
        setVisibleEvaluations(evaluations)

    }, [evaluations])


    const setAsIndicator = async (projectId: string, evaluationId: string) => {
        await setIndicatorStatus(projectId, evaluationId)
        if (refetchActiveEvaluations) {
            refetchActiveEvaluations()
        }
    }

    let columns: Column[] = [
        { name: 'Title', accessor: 'name', sortable: true },
        { name: 'Workflow', accessor: 'progression', sortable: true },
        { name: 'Bowtie status', accessor: 'bowtie', sortable: false },
        { name: 'Overdue actions', accessor: 'overdue_actions', sortable: true },
        { name: 'Open actions', accessor: 'open_actions', sortable: true },
        { name: 'Closed actions', accessor: 'closed_actions', sortable: true },
        { name: 'Date created', accessor: 'createDate', sortable: true },
        ...(isInPortfolio ? [
            { name: 'Select active evaluation', accessor: 'select', sortable: false },
            { name: 'Hide evaluation', accessor: 'hide', sortable: false }
        ] : [
            { name: 'Active evaluation', accessor: 'indicator', sortable: false },
        ])
    ]

    if (currentProject === null || currentProject === undefined) {
        return <p>No project selected</p>
    }

    const hideEvaluation = (evaluation: Evaluation) => {
        const newStatus = Status.Voided
        setEvaluationStatus(evaluation.id, newStatus)
        setVisibleEvaluations(visibleEvaluations.filter(e => e.id !== evaluation.id))
        //TODO: trigger a refresh of evaluations here. the visibleEvaluations does not correctly keep the evaluation hidden when the user navigates to a different view and back
        if (refetchActiveEvaluations) {
            refetchActiveEvaluations()
        }
    }

    const sortOnAccessor = (a: Evaluation, b: Evaluation, accessor: string, sortDirection: SortDirection) => {
        switch (accessor) {
            case 'name': {
                return sort(a.name.toLowerCase(), b.name.toLowerCase(), sortDirection)
            }
            case 'progression': {
                const numCompletedA = countProgressionStatus(ProgressionStatus.Complete, a.progression)
                const numCompletedB = countProgressionStatus(ProgressionStatus.Complete, b.progression)
                return sort(numCompletedA, numCompletedB, sortDirection)
            }
            case 'overdue_actions': {
                const actionsByStateA = getEvaluationActionsByState(a)
                const actionsByStateB = getEvaluationActionsByState(b)
                return sort(actionsByStateA.overdueActions.length, actionsByStateB.overdueActions.length, sortDirection)
            }
            case 'open_actions': {
                const actionsByStateA = getEvaluationActionsByState(a)
                const actionsByStateB = getEvaluationActionsByState(b)
                return sort(actionsByStateA.openActions.length, actionsByStateB.openActions.length, sortDirection)
            }
            case 'closed_actions': {
                const actionsByStateA = getEvaluationActionsByState(a)
                const actionsByStateB = getEvaluationActionsByState(b)
                return sort(actionsByStateA.closedActions.length, actionsByStateB.closedActions.length, sortDirection)
            }
            case 'createDate': {
                return sort(a.createDate, b.createDate, sortDirection)
            }
            default:
                return sort(a.name, b.name, sortDirection)
        }
    }

    const renderRow = (evaluation: Evaluation, index: number) => {
        if (evaluation.project.fusionProjectId === "a58880a6-7ac7-471e-a4e6-139fa403f230") {
            console.log("EvaluationTable.tsx: evaluation: ", evaluation)
        }
        const isWorkshopOrLater =
            evaluation.progression === Progression.Workshop ||
            evaluation.progression === Progression.FollowUp ||
            evaluation.progression === Progression.Finished
        const showBowtieContent = evaluation.questions && isWorkshopOrLater
        const answersWithBarrier = showBowtieContent
            ? assignAnswerToBarrierQuestions(evaluation.questions, Progression.Finished ? Progression.FollowUp : evaluation.progression)
            : []
        const actionsByState = getEvaluationActionsByState(evaluation)

        const getLastCharacter = (str: string) => {
            return str.charAt(str.length - 1)
        }

        const getEvaluationLink = (location: any) => {
            if (location.pathname.includes('bmt/')) {
                if (getLastCharacter(location.pathname) === "/") {
                    return ({ ...location, pathname: `evaluation/${evaluation.id}` })
                }
                return ({ ...location, pathname: `${currentProject.currentContext?.id}/evaluation/${evaluation.id}` })
            }
            return ({ ...location, pathname: `/${currentProject.currentContext?.id}/evaluation/${evaluation.id}` })
        }

        return (
            <Row key={index}>
                <CellWithBorder>
                    <Link to={(location: any) => getEvaluationLink(location)} style={{ textDecoration: 'none' }}>
                        <Typography
                            color="primary"
                            variant="body_short"
                            token={{
                                fontSize: '1.2rem',
                            }}
                        >
                            {evaluation.name}
                        </Typography>
                    </Link>
                </CellWithBorder>
                <CellWithBorder>
                    <Centered>
                        {Object.values(Progression)
                            .filter(p => p !== Progression.Finished)
                            .map(progression => (
                                <Tooltip
                                    key={index + progression}
                                    placement="bottom"
                                    title={
                                        progressionToString(progression) +
                                        ' ' +
                                        calcProgressionStatus(evaluation.progression, progression).toLowerCase()
                                    }
                                >
                                    <span>
                                        <ProgressStatusIcon progression={evaluation.progression} compareProgression={progression} />
                                    </span>
                                </Tooltip>
                            ))}
                    </Centered>
                </CellWithBorder>
                <CellWithBorder>
                    <Centered>
                        <Bowtie answersWithBarrier={answersWithBarrier} isDense />
                    </Centered>
                </CellWithBorder>
                <CellWithBorder>
                    {actionsByState.overdueActions.length > 0 && (
                        <Centered>
                            <span
                                style={{
                                    color: WARNING_COLOR,
                                    paddingRight: '10px',
                                }}
                            >
                                {actionsByState.overdueActions.length}
                            </span>
                            <Icon data={warning_filled} color={WARNING_COLOR} />
                        </Centered>
                    )}
                </CellWithBorder>
                <CellWithBorder>
                    {actionsByState.openActions.length > 0 && <Centered>{actionsByState.openActions.length}</Centered>}
                </CellWithBorder>
                <CellWithBorder>
                    {actionsByState.closedActions.length > 0 && <Centered>{actionsByState.closedActions.length}</Centered>}
                </CellWithBorder>
                <CellWithBorder>
                    <Centered>{new Date(evaluation.createDate).toLocaleDateString()}</Centered>
                </CellWithBorder>
                {
                    isInPortfolio ? (
                        <>
                            <CellWithBorder>
                                <Centered>
                                    <Tooltip title={evaluation.progression !== "FOLLOW_UP" ? "Evaluation status must be in 'follow-up'" : "Select as active evaluation"}>
                                        <Radio
                                            checked={evaluation.project.indicatorEvaluationId === evaluation.id}
                                            disabled={evaluation.progression !== "FOLLOW_UP"}
                                            onChange={() => setAsIndicator(evaluation.projectId, evaluation.id)}
                                        />
                                    </Tooltip>
                                </Centered>
                            </CellWithBorder>
                            <Cell>
                                <Centered>
                                    <CellButton
                                        data={visibility_off}
                                        onClick={() => hideEvaluation(evaluation)}
                                    />
                                </Centered>
                            </Cell>
                        </>
                    ) : (
                        evaluation.project.indicatorEvaluationId === evaluation.id ?
                            <CellWithBorder>
                                <Centered>
                                    <Icon data={check} color="green" />
                                </Centered>
                            </CellWithBorder>
                            :
                            <CellWithBorder>
                                <Centered>
                                </Centered>
                            </CellWithBorder>
                    )
                }
            </Row>
        )
    }


    return (
        <>
            <SortableTable
                columns={columns}
                data={visibleEvaluations}
                sortOnAccessor={sortOnAccessor}
                renderRow={renderRow}
                testId="project-table"
            />
        </>
    )
}

export default EvaluationsTable
