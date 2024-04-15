import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Icon, Table, Tooltip, Typography, Radio, Button } from '@equinor/eds-core-react'
import {
    warning_filled,
    check,
    visibility,
} from '@equinor/eds-icons'
import { tokens } from '@equinor/eds-tokens'
import { progressionToString } from '../../../../utils/EnumToString'
import { calcProgressionStatus, countProgressionStatus, ProgressionStatus } from '../../../../utils/ProgressionStatus'
import { sort, SortDirection } from '../../../../utils/sort'
import { Evaluation, Progression, Role } from '../../../../api/models'
import { assignAnswerToBarrierQuestions } from '../../../Evaluation/FollowUp/util/helpers'
import { getEvaluationActionsByState } from '../../../../utils/actionUtils'
import Bowtie from '../../../../components/Bowtie/Bowtie'
import SortableTable, { Column } from '../../../../components/SortableTable'
import ProgressStatusIcon from './ProgressStatusIcon'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'
import { useSetEvaluationStatusMutation } from '../../../../views/Evaluation/Nomination/NominationView'
import { Status } from '../../../../api/models'
import { ApolloError, useMutation, gql } from '@apollo/client'
import { getCachedRoles } from '../../../../utils/helpers'
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks'
import ConfirmationDialog from '../../../../components/ConfirmationDialog'

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
interface setProjectIndicatorMutationProps {
    setIndicatorStatus: (projectId: string, evaluationId: string) => void
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

    const setIndicatorStatus = (projectId: string, evaluationId: string) => {
        setIndicatorApolloFunc({ variables: { projectId, evaluationId } })
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
}

const EvaluationsTable = ({ evaluations, isInPortfolio }: Props) => {
    const currentProject = useModuleCurrentContext()
    const currentUser = useCurrentUser()
    const { setEvaluationStatus } = useSetEvaluationStatusMutation()
    const { setIndicatorStatus } = useSetProjectIndicatorMutation()

    const userIsAdmin = currentUser && getCachedRoles()?.includes('Role.Admin')
    const [visibleEvaluations, setVisibleEvaluations] = React.useState<Evaluation[]>(evaluations)
    const [userRoles, setUserRoles] = React.useState<{ evaluationId: string, role: Role }[]>([])
    const [confirmationIsOpen, setConfirmationIsOpen] = React.useState(false)
    const [evaluationStagedToHide, setEvaluationStagedToHide] = React.useState<Evaluation | null>(null)

    useEffect(() => {
        console.log('cached roles')
        console.log(getCachedRoles())
    }, [])

    const canSetAsIndicator = (evaluation: Evaluation) => {
        const userRole = userRoles.find(role => role.evaluationId === evaluation.id)?.role

        const isFacilitator = userRole === Role.Facilitator
        const evaluationIsActive = evaluation.project.indicatorEvaluationId === evaluation.id
        const evaluationIsNotInFollowUp = evaluation.progression !== Progression.FollowUp

        return (isFacilitator && evaluationIsNotInFollowUp && !evaluationIsActive) || userIsAdmin
    }

    const canHide = (evaluation: Evaluation) => {
        const userRole = userRoles.find(role => role.evaluationId === evaluation.id)?.role

        const isFacilitator = userRole === Role.Facilitator
        const evaluationIsNotActive = evaluation.project.indicatorEvaluationId !== evaluation.id

        return evaluationIsNotActive && (isFacilitator || userIsAdmin)
    }

    const canViewActiveEvaluations = () => {
        const acceptableRoles = ["Role.OrganizationLead", "Role.Participant"]
        const usersRoles = getCachedRoles()
        // TODO: remove when someone with an accepted role has tested this
        console.error("user has these roles: ", usersRoles)
        console.error("acceptable roles: ", acceptableRoles)
        console.error("user has acceptable role to view active evaluations?: ", acceptableRoles.some(role => usersRoles?.includes(role)))
        return acceptableRoles.some(role => usersRoles?.includes(role))
    }

    const setAsIndicator = (projectId: string, evaluationId: string) => {
        setIndicatorStatus(projectId, evaluationId)
    }

    useEffect(() => {
        evaluations.forEach(evaluation => {

            evaluation.participants?.forEach(participant => {
                const userIsParticipant = participant.azureUniqueId === currentUser?.localAccountId

                if (userIsParticipant) {
                    const userRole = participant.role as Role
                    const roleEntry = { evaluationId: evaluation.id, role: userRole }
                    setUserRoles([...userRoles, roleEntry])
                }
            })
        })
    }, [evaluations])

    let columns: Column[] = [
        { name: 'Title', accessor: 'name', sortable: true },
        { name: 'Workflow', accessor: 'progression', sortable: true },
        { name: 'Bowtie status', accessor: 'bowtie', sortable: false },
        { name: 'Overdue actions', accessor: 'overdue_actions', sortable: true },
        { name: 'Open actions', accessor: 'open_actions', sortable: true },
        { name: 'Closed actions', accessor: 'closed_actions', sortable: true },
        { name: 'Date created', accessor: 'createDate', sortable: true },
        ...(isInPortfolio && userIsAdmin ? [
            { name: 'Select active evaluation', accessor: 'select', sortable: false },
            { name: 'Hide evaluation', accessor: 'hide', sortable: false }
        ] : []),
        ...(canViewActiveEvaluations() && !isInPortfolio ? [
            { name: 'Active evaluation', accessor: 'indicator', sortable: false },
        ] : [])
    ]

    if (currentProject === null || currentProject === undefined) {
        return <p>No project selected</p>
    }

    const promptConfirmation = (evaluation: Evaluation) => {
        setConfirmationIsOpen(true)
        setEvaluationStagedToHide(evaluation)
    }

    const cancelConfirmation = () => {
        setConfirmationIsOpen(false)
        setEvaluationStagedToHide(null)
    }

    const hideEvaluation = () => {
        if (evaluationStagedToHide) {
            const newStatus = Status.Voided
            setEvaluationStatus(evaluationStagedToHide.id, newStatus)
            setVisibleEvaluations(visibleEvaluations.filter(e => e.id !== evaluationStagedToHide.id))
            setConfirmationIsOpen(false)
            setEvaluationStagedToHide(null)
            //TODO: trigger a refresh of evaluations here. the visibleEvaluations does not correctly keep the evaluation hidden when the user navigates to a different view and back
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
                    isInPortfolio && (
                        <>
                            <CellWithBorder>
                                <Centered>
                                    <Radio
                                        checked={evaluation.project.indicatorEvaluationId === evaluation.id}
                                        disabled={canSetAsIndicator(evaluation) ? false : true}
                                        onChange={() => setAsIndicator(evaluation.projectId, evaluation.id)}
                                    />
                                </Centered>
                            </CellWithBorder>
                            <Cell>
                                <Centered>
                                    <Tooltip
                                        title={
                                            evaluation.project.indicatorEvaluationId === evaluation.id
                                                ? "Active evaluation can not be hidden"
                                                : "Set as active evaluation"
                                        }
                                        placement="top">
                                        <Button
                                            variant="ghost_icon"
                                            onClick={() => promptConfirmation(evaluation)}
                                            disabled={canHide(evaluation) ? false : true}

                                        >
                                            <Icon data={visibility} />
                                        </Button>
                                    </Tooltip>
                                </Centered>
                            </Cell>
                        </>
                    )}
                {
                    canViewActiveEvaluations() && !isInPortfolio &&
                    (
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
            <ConfirmationDialog
                isOpen={confirmationIsOpen}
                title="Hide evaluation"
                description="Are you sure you want to hide this evaluation?"
                onConfirmClick={() => {
                    hideEvaluation()
                }}
                onCancelClick={() => {
                    cancelConfirmation()
                }}
            />
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
