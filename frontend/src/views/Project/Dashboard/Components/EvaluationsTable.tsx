import React, { useEffect } from 'react'
import styled from 'styled-components'
import { Icon, Table, Tooltip, Typography, Radio, Button } from '@equinor/eds-core-react'
import { warning_filled, check, visibility } from '@equinor/eds-icons'
import { tokens } from '@equinor/eds-tokens'
import { progressionToString } from '../../../../utils/EnumToString'
import { calcProgressionStatus, countProgressionStatus, ProgressionStatus } from '../../../../utils/ProgressionStatus'
import { sort, SortDirection } from '../../../../utils/sort'
import { BmtScore, Evaluation, Progression, Role } from '../../../../api/models'
import { ProjectBMTScore, ProjectIndicator, UserRolesInEvaluation } from '../../../../utils/helperModels'
import { assignAnswerToBarrierQuestions } from '../../../Evaluation/FollowUp/util/helpers'
import { getEvaluationActionsByState } from '../../../../utils/actionUtils'
import Bowtie from '../../../../components/Bowtie/Bowtie'
import SortableTable, { Column } from '../../../../components/SortableTable'
import ProgressStatusIcon from './ProgressStatusIcon'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'
import { useSetEvaluationStatusMutation } from '../../../../views/Evaluation/Nomination/NominationView'
import { Status } from '../../../../api/models'
import { ApolloError, useMutation, gql, FetchResult } from '@apollo/client'
import { getCachedRoles, evaluationCanBeHidden, canSetEvaluationAsIndicator } from '../../../../utils/helpers'
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks'
import ConfirmationDialog from '../../../../components/ConfirmationDialog'
import { useAppContext } from '../../../../context/AppContext'
import { useHistory } from 'react-router-dom'

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
    setIndicatorStatus: (projectId: string, evaluationId: string) => Promise<void>
    loading: boolean
    error: ApolloError | undefined
}

const useSetProjectIndicatorMutation = (): setProjectIndicatorMutationProps => {
    const SET_EVALUATION_STATUS_MUTATION = gql`
        mutation SetIndicatorEvaluation($projectId: String!, $evaluationId: String!) {
            setIndicatorEvaluation(projectId: $projectId, evaluationId: $evaluationId) {
                id
                externalId
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
    setProjectIndicators?: (projectIndicators: ProjectIndicator[]) => void
    projectIndicators?: ProjectIndicator[]
    setProjectBmtScores?: (projectBMTScores: ProjectBMTScore[]) => void
    projectBMTScores?: ProjectBMTScore[]
}

const EvaluationsTable = ({
    evaluations,
    isInPortfolio,
    setProjectIndicators,
    projectIndicators,
    setProjectBmtScores,
    projectBMTScores
}: Props) => {
    const currentContext = useModuleCurrentContext()
    const currentUser = useCurrentUser()
    const userIsAdmin = currentUser && getCachedRoles()?.includes('Role.Admin') ? true : false

    const history = useHistory()
    const { setCurrentContext } = useModuleCurrentContext()
    const { setCurrentProject, setCurrentEvaluation } = useAppContext()

    const { setEvaluationStatus } = useSetEvaluationStatusMutation()
    const { setIndicatorStatus } = useSetProjectIndicatorMutation()
    const { generateBMTScore, loading: loadingProgressEvaluation1, error: errorProgressEvaluation1 } = useGenerateBMTScoreMutation()

    const [visibleEvaluations, setVisibleEvaluations] = React.useState<Evaluation[]>([])
    const [hiddenEvaluationIds, setHiddenEvaluationIds] = React.useState<string[]>([])

    const [userRoles, setUserRoles] = React.useState<UserRolesInEvaluation[]>([])
    const [confirmationIsOpen, setConfirmationIsOpen] = React.useState(false)
    const [evaluationStagedToHide, setEvaluationStagedToHide] = React.useState<Evaluation | null>(null)
    const [userIsFacilitatorInAtLeastOneEvaluation, setUserIsFacilitatorInAtLeastOneEvaluation] = React.useState(false)

    const { projects, setEvaluationsFetched } = useAppContext()

    useEffect(() => {
        const filteredEvaluations = evaluations.filter(evaluation => !hiddenEvaluationIds.includes(evaluation.id))
        setVisibleEvaluations(filteredEvaluations)

    }, [evaluations, hiddenEvaluationIds])


    const setAsIndicator = async (projectId: string, evaluationId: string) => {
        if (!setProjectIndicators || !projectIndicators || !setEvaluationsFetched || !projectBMTScores || !setProjectBmtScores) {
            return;
        }

        const updateOrAddItem = (items: any[], newItem: any) => {
            const itemIndex = items.findIndex(i => i.projectId === projectId);
            if (itemIndex > -1) {
                const updatedItems = [...items];
                updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...newItem };
                return updatedItems;
            } else {
                return [...items, newItem];
            }
        }

        const updatedProjectIndicators = updateOrAddItem(projectIndicators, { projectId, evaluationId });
        setProjectIndicators(updatedProjectIndicators);

        await setIndicatorStatus(projectId, evaluationId)

        const [_, generateBMTScoreResponse] = await Promise.all([
            setEvaluationsFetched(false),
            generateBMTScore(projectId)
        ]);

        // @ts-ignore
        const newBmtScore = generateBMTScoreResponse.data?.generateBMTScore?.followUpScore;

        const updatedProjectBMTScores = updateOrAddItem(projectBMTScores, { projectId, bmtScore: newBmtScore });
        setProjectBmtScores(updatedProjectBMTScores);
    }

    let columns: Column[] = [
        { name: 'Title', accessor: 'name', sortable: true },
        { name: 'Workflow', accessor: 'progression', sortable: true },
        { name: 'Bowtie status', accessor: 'bowtie', sortable: false },
        { name: 'Overdue actions', accessor: 'overdue_actions', sortable: true },
        { name: 'Open actions', accessor: 'open_actions', sortable: true },
        { name: 'Closed actions', accessor: 'closed_actions', sortable: true },
        { name: 'Date created', accessor: 'createDate', sortable: true },
        ...(isInPortfolio ? (userIsAdmin || userIsFacilitatorInAtLeastOneEvaluation) ? [
            { name: 'Select active evaluation', accessor: 'select', sortable: false },
            { name: 'Hide evaluation', accessor: 'hide', sortable: false }
        ] : [
            { name: 'Active evaluation', accessor: 'indicator', sortable: false },
        ] : [])
    ]

    // finds all roles for the current user in the evaluations
    useEffect(() => {
        const newUserRoles = evaluations.flatMap(evaluation => {
            return evaluation.participants?.filter(participant =>
                participant.azureUniqueId === currentUser?.localAccountId
            ).map(participant => {
                return { evaluationId: evaluation.id, role: participant.role }
            }) || []
        })

        setUserRoles(userRoles => [...userRoles, ...newUserRoles])
    }, [evaluations, currentUser?.localAccountId])

    useEffect(() => {
        setUserIsFacilitatorInAtLeastOneEvaluation(userRoles.some(role => role.role === Role.Facilitator))
    }, [userRoles])

    const hideEvaluation = async () => {
        if (evaluationStagedToHide) {
            const newStatus = Status.Voided
            setEvaluationStatus(evaluationStagedToHide.id, newStatus)
            setVisibleEvaluations(visibleEvaluations.filter(e => e.id !== evaluationStagedToHide.id))
            setConfirmationIsOpen(false)
            setEvaluationStagedToHide(null)
            setHiddenEvaluationIds([...hiddenEvaluationIds, evaluationStagedToHide.id])
            await setEvaluationStatus(evaluationStagedToHide.id, newStatus)
            if (setEvaluationsFetched) {
                setEvaluationsFetched(false)
            }
        }

    }
    const promptConfirmation = (evaluation: Evaluation) => {
        setConfirmationIsOpen(true)
        setEvaluationStagedToHide(evaluation)
    }

    const cancelConfirmation = () => {
        setConfirmationIsOpen(false)
        setEvaluationStagedToHide(null)
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

        const isChecked = (): boolean => {
            if (projectIndicators && projectIndicators.some(pi => pi.projectId === evaluation.projectId)) {
                return projectIndicators.some(pi => pi.evaluationId === evaluation.id)
            }
            return evaluation.project.indicatorEvaluationId === evaluation.id
        }

        const getContextId = () => {
            let evaluationProject = projects.filter(project => project.externalId === evaluation.project.externalId)[0]
            if (evaluationProject) {
                return evaluationProject.fusionProjectId
            }
        }

        const getProjectId = () => {
            let evaluationProject = projects.filter(project => project.externalId === evaluation.project.externalId)[0]
            if (evaluationProject) {
                return evaluationProject
            }
        }

        return (
            <Row key={index}>
                <CellWithBorder>
                    <Typography
                        color="primary"
                        variant="body_short"
                        token={{
                            fontSize: '1.2rem',
                        }}
                        link
                        onClick={() => {
                            setCurrentContext(getContextId())
                            setCurrentProject(getProjectId())
                            setCurrentEvaluation(evaluation)
                            history.push(`/apps/bmt/${getContextId()}/evaluation/${evaluation.id}`)
                        }}
                    >
                        {evaluation.name}
                    </Typography>
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
                        (userIsAdmin || userIsFacilitatorInAtLeastOneEvaluation) ? (
                            <>
                                <CellWithBorder>
                                    <Centered>
                                        <Tooltip
                                            title={canSetEvaluationAsIndicator(evaluation, userRoles, userIsAdmin).toolTipMessage}
                                            placement="top"
                                        >
                                            <Radio
                                                checked={isChecked()}
                                                disabled={!canSetEvaluationAsIndicator(evaluation, userRoles, userIsAdmin).canSetAsIndicator}
                                                onChange={() => setAsIndicator(evaluation.projectId, evaluation.id)}
                                            />
                                        </Tooltip>
                                    </Centered>
                                </CellWithBorder>
                                <Cell>
                                    <Centered>
                                        <Tooltip
                                            title={evaluationCanBeHidden(evaluation, userRoles, userIsAdmin).toolTipMessage}
                                            placement="top"
                                        >
                                            <Button
                                                variant="ghost_icon"
                                                onClick={() => promptConfirmation(evaluation)}
                                                disabled={!evaluationCanBeHidden(evaluation, userRoles, userIsAdmin).canHide}
                                            >
                                                <Icon data={visibility} />
                                            </Button>
                                        </Tooltip>
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
                    )
                }
            </Row>
        )
    }

    if (!userRoles) {
        return <p>Loading user roles...</p>;
    }

    if (!currentContext) {
        return <p>No project selected</p>
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


interface useGenerateBMTScoreMutationProps {
    generateBMTScore: (evaluationId: string) => Promise<FetchResult<BmtScore>>
    loading: boolean
    score: string
    error: ApolloError | undefined
}

const useGenerateBMTScoreMutation = (): useGenerateBMTScoreMutationProps => {
    const GENERATE_BMTSCORE = gql`
    mutation GenerateBMTScore($projectId: String!) {
        generateBMTScore(projectId: $projectId) {
                evaluationId
                projectId
                workshopScore
                followUpScore
            }
        }
    `

    const [generateBMTScoreApolloFunc, { loading, data, error }] = useMutation(GENERATE_BMTSCORE)

    const generateBMTScore = (projectId: string) => {
        return generateBMTScoreApolloFunc({ variables: { projectId } })
    }

    return {
        generateBMTScore: generateBMTScore,
        loading,
        score: data,
        error,
    }
}
