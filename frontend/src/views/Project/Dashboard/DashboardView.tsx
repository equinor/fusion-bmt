import React, { useEffect } from 'react'
import styled from 'styled-components'
import { ApolloError, FetchResult, gql, useMutation, useQuery, ApolloQueryResult } from '@apollo/client'
import { Accordion, Chip, CircularProgress, Icon, Typography } from '@equinor/eds-core-react'
import ErrorMessage from '../../../components/ErrorMessage'
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks'
import { getCachedRoles } from '../../../utils/helpers'

import { genericErrorMessage } from '../../../utils/Variables'
import { BmtScore, Evaluation, Project, Status } from '../../../api/models'
import { EVALUATION_DASHBOARD_FIELDS_FRAGMENT } from '../../../api/fragments'
import { useEvaluationsWithPortfolio } from '../../../utils/hooks'
import Portfolios from './Components/Portfolios'
import EvaluationsTable from './Components/EvaluationsTable'
import CreateEvaluationButton from './Components/CreateEvaluationButton'
import { centered } from '../../../utils/styles'
import { Grid } from '@mui/material'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'
import { visibility, account_circle } from '@equinor/eds-icons'
import { useAppContext } from '../../../context/AppContext'

const Chips = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 20px;
`

const StyledChip = styled(Chip)`
    cursor: pointer;
    padding-left: 10px;
    margin-right: 10px;
`

enum TableSelection {
    Portfolio = 'PORTFOLIO',
    Project = 'PROJECT',
    User = 'USER',
    HiddenProject = 'HIDDEN_PROJECT',
    HiddenUserProject = 'HIDDEN_USER_PROJECT',
    HiddenUser = 'HIDDEN_USER',
}
interface MapTableSelectionToTextProps {
    tableSelection: React.ReactNode
    projectId: string | undefined
}
const MapTableSelectionToText: React.FC<MapTableSelectionToTextProps> = ({ tableSelection, projectId }) => {
    const projectLabel = projectId ? 'project' : ''
    switch (tableSelection) {
        case 'USER': {
            return (
                <>
                    <Icon data={account_circle} size={16} />
                    {`My ${projectLabel} evaluations`}
                </>
            )
        }
        case 'PROJECT': {
            return 'Project evaluations'
        }
        case 'HIDDEN_PROJECT': {
            return (
                <>
                    <Icon data={visibility} size={16} />
                    {`Hidden project evaluations`}
                </>
            )
        }
        case 'HIDDEN_USER': {
            return (
                <>
                    <Icon data={visibility} size={16} />
                    {`Hidden evaluations`}
                </>
            )
        }
        case 'HIDDEN_USER_PROJECT': {
            return (
                <>
                    <Icon data={visibility} size={16} />
                    {`My project hidden evaluations`}
                </>
            )
        }
        case 'PORTFOLIO': {
            return 'All evaluations'
        }
    }
}

const CenteredCircularProgress = () => {
    return (
        <div style={centered}>
            <CircularProgress />
        </div>
    )
}

interface Props {
    project: Project
}

const DashboardView = ({ project }: Props) => {
    const { currentContext } = useModuleCurrentContext()
    const currentUser = useCurrentUser()
    //generatedBMTScores is an object
    const [generatedBMTScores, setGeneratedBMTScores] = React.useState<BmtScore[] | undefined>(undefined)

    const { generateBMTScores, loading: loadingProgressEvaluation, error: errorProgressEvaluation } = useGenerateBMTScoresMutation()

    if (!currentUser) {
        return <p>Please log in.</p>
    }

    const [selectedProjectTable, setSelectedProjectTable] = React.useState<string>(TableSelection.Portfolio)
    const userIsAdmin = currentUser && getCachedRoles()?.includes('Role.Admin')
    const myEvaluationsSelected = selectedProjectTable === TableSelection.User
    const projectEvaluationsSelected = selectedProjectTable === TableSelection.Project
    const hiddenUserEvaluationsSelected = selectedProjectTable === TableSelection.HiddenUser
    const hiddenProjectEvaluationsSelected = selectedProjectTable === TableSelection.HiddenProject
    const hiddenUserProjectEvaluationsSelected = selectedProjectTable === TableSelection.HiddenUserProject
    const portfoliosSelected = selectedProjectTable === TableSelection.Portfolio

    const {
        loading: loadingActiveEvaluations,
        evaluations: activeEvaluations,
        error: errorActiveEvaluations,
        refetch: refetchActiveEvaluations,
    } = useAllEvaluationsQuery(Status.Active)

    const allActiveEvaluationsWithProjectMasterAndPortfolio = useEvaluationsWithPortfolio(activeEvaluations) // TODO: re render when status changes

    const errorMessage = <ErrorMessage title="Error" message={genericErrorMessage} />

    const { projectsByUser, projectsByUserHidden, loadingEvaluations, evaluationsByUserProject, evaluationsByUserProjectHidden, evaluationsByUser, evaluationsByUserHidden, evaluationsByProject, evaluationsByProjectHidden } = useAppContext()

    useEffect(() => {
        const generateScore = async () => {
            const score = await generateBMTScores()
            if (score.data) {
                setGeneratedBMTScores(score.data)
            }
        }
        generateScore();
    }, [])

    useEffect(() => {
        if (currentContext) {
            setSelectedProjectTable(TableSelection.Project)
        } else {
            setSelectedProjectTable(TableSelection.Portfolio)
        }
    }, [currentContext])

    return (
        <Grid container justifyContent="space-between">
            <Grid item>
                <Chips>
                    {Object.values(TableSelection).map(value => {
                        if (
                            (!userIsAdmin && value === TableSelection.HiddenProject) ||
                            (value === TableSelection.HiddenUser && currentContext) ||
                            (currentContext && value === TableSelection.Portfolio) ||
                            (!currentContext && (value === TableSelection.Project || value === TableSelection.HiddenProject || value === TableSelection.HiddenUserProject)) ||
                            (value === TableSelection.User && currentContext && evaluationsByUserProject.length === 0) ||
                            (value === TableSelection.User && !currentContext && evaluationsByUser.length === 0) ||
                            (value === TableSelection.HiddenProject && evaluationsByProjectHidden.length === 0) ||
                            (value === TableSelection.HiddenUserProject && evaluationsByUserProjectHidden.length === 0) ||
                            (value === TableSelection.HiddenUser && evaluationsByUserHidden.length === 0)
                        ) {
                            return undefined
                        } else {
                            return (
                                <div key={value}>
                                    <StyledChip
                                        variant={selectedProjectTable === value ? 'active' : 'default'}
                                        onClick={() => setSelectedProjectTable(value)}
                                    >
                                        <MapTableSelectionToText
                                            tableSelection={
                                                value === TableSelection.Portfolio && !currentContext ? TableSelection.Portfolio : value
                                            }
                                            projectId={currentContext?.id}
                                        />
                                    </StyledChip>
                                </div>
                            )
                        }
                    })}
                </Chips>
            </Grid>
            <Grid item>
                <CreateEvaluationButton />
                <Typography
                    link
                    href="https://statoilsrm.sharepoint.com/sites/ProjectDevelopmentCenter/SitePages/Products-and-Contact-information.aspx"
                >
                    Order a BMT evaluation through PDC
                </Typography>
            </Grid>
            <Grid item xs={12}>
                {(myEvaluationsSelected && currentContext) && (
                    <>
                        {evaluationsByUserProject && <EvaluationsTable evaluations={evaluationsByUserProject} />}
                        {loadingEvaluations && <CenteredCircularProgress />}
                        {evaluationsByUserProject.length === 0 && errorMessage}
                    </>
                )}
                {projectEvaluationsSelected && (
                    <>
                        {evaluationsByProject && <EvaluationsTable evaluations={evaluationsByProject} />}
                        {loadingEvaluations && <CenteredCircularProgress />}
                        {evaluationsByProject.length === 0 && errorMessage}
                    </>
                )}
                {(hiddenProjectEvaluationsSelected) && (
                    <>
                        {evaluationsByProjectHidden && <EvaluationsTable evaluations={evaluationsByProjectHidden} />}
                        {loadingEvaluations && <CenteredCircularProgress />}
                        {evaluationsByProjectHidden.length === 0 && errorMessage}
                    </>
                )}
                {(hiddenUserEvaluationsSelected) && (
                    <>
                        {evaluationsByUserHidden && 
                            <Accordion headerLevel="h3">
                                {projectsByUserHidden.map(projectByUserHidden => (
                                    <Accordion.Item key={projectByUserHidden.id} isExpanded>
                                        <Accordion.Header>{projectByUserHidden.title}</Accordion.Header>
                                        <Accordion.Panel>
                                        <EvaluationsTable evaluations={evaluationsByUserHidden.filter((ebuh: Evaluation) => ebuh.project.externalId === projectByUserHidden.externalId)} />
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        }
                        {loadingEvaluations && <CenteredCircularProgress />}
                        {evaluationsByUserHidden.length === 0 && errorMessage}
                    </>
                )}
                {(hiddenUserProjectEvaluationsSelected && currentContext) && (
                    <>
                        {evaluationsByUserProjectHidden && <EvaluationsTable evaluations={evaluationsByUserProjectHidden} />}
                        {loadingEvaluations && <CenteredCircularProgress />}
                        {evaluationsByUserProjectHidden.length === 0 && errorMessage}
                    </>
                )}
                {portfoliosSelected && (
                    <>
                        {allActiveEvaluationsWithProjectMasterAndPortfolio && (
                            <Portfolios
                                evaluationsWithProjectMasterAndPortfolio={allActiveEvaluationsWithProjectMasterAndPortfolio}
                                generatedBMTScores={generatedBMTScores}
                                refetchActiveEvaluations={refetchActiveEvaluations}
                            />
                        )}
                        {(loadingActiveEvaluations || !allActiveEvaluationsWithProjectMasterAndPortfolio) && <CenteredCircularProgress />}
                        {errorActiveEvaluations !== undefined && errorMessage}
                    </>
                )}
                {(myEvaluationsSelected && !currentContext && evaluationsByUser) && (
                    <Accordion headerLevel="h3">
                        {projectsByUser.map(projectByUser => (
                            <Accordion.Item key={projectByUser.id} isExpanded>
                                <Accordion.Header>{projectByUser.title}</Accordion.Header>
                                <Accordion.Panel>
                                    <EvaluationsTable evaluations={evaluationsByUser.filter((ebu: Evaluation) => ebu.project.externalId === projectByUser.externalId)} />
                                </Accordion.Panel>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                )}
            </Grid>
        </Grid>
    )
}

export default DashboardView

interface EvaluationQueryProps {
    loading: boolean
    evaluations: Evaluation[] | undefined
    error: ApolloError | undefined
    refetch?: () => Promise<ApolloQueryResult<{evaluations: Evaluation[]}>>
}

export const useUserEvaluationsQuery = (azureUniqueId: string): EvaluationQueryProps => {
    const GET_EVALUATIONS = gql`
        query ($azureUniqueId: String!) {
            evaluations(where: { participants: { some: { azureUniqueId: { eq: $azureUniqueId } } } }) {
                ...EvaluationDashboardFields
            }
        }
        ${EVALUATION_DASHBOARD_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{ evaluations: Evaluation[] }>(GET_EVALUATIONS, { variables: { azureUniqueId } })

    return {
        loading,
        evaluations: data?.evaluations,
        error,
    }
}

export const useProjectEvaluationsQuery = (projectId: string, status: Status): EvaluationQueryProps => {
    const GET_EVALUATIONS = gql`
        query ($projectId: String!, $status: Status!) {
            evaluations(where: { project: { id: { eq: $projectId } }, status: { eq: $status } }) {
                ...EvaluationDashboardFields
            }
        }
        ${EVALUATION_DASHBOARD_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{ evaluations: Evaluation[] }>(GET_EVALUATIONS, {
        variables: {
            projectId,
            status,
        },
    })

    return {
        loading,
        evaluations: data?.evaluations,
        error,
    }
}

export const useAllEvaluationsQuery = (status: Status): EvaluationQueryProps => {
    const GET_EVALUATIONS = gql`
        query ($status: Status!) {
            evaluations(where: { status: { eq: $status } }) {
                ...EvaluationDashboardFields
            }
        }
        ${EVALUATION_DASHBOARD_FIELDS_FRAGMENT}
    `

    const { loading, data, error, refetch } = useQuery<{ evaluations: Evaluation[] }>(GET_EVALUATIONS, { variables: { status } })

    return {
        loading,
        evaluations: data?.evaluations,
        error,
        refetch
    }
}

interface useGenerateBMTScoresMutationProps {
    generateBMTScores: () => Promise<FetchResult<BmtScore[]>>
    loading: boolean
    score: string
    error: ApolloError | undefined
}

const useGenerateBMTScoresMutation = (): useGenerateBMTScoresMutationProps => {
    const GENERATE_BMTSCORE = gql`
        mutation GenerateBMTScores {
            generateBMTScores {
                evaluationId
                projectId
                workshopScore
                followUpScore
            }
        }
    `

    const [generateBMTScoresApolloFunc, { loading, data, error }] = useMutation(GENERATE_BMTSCORE)

    const generateBMTScores = () => {
        return generateBMTScoresApolloFunc()
    }

    return {
        generateBMTScores: generateBMTScores,
        loading,
        score: data,
        error,
    }
}
