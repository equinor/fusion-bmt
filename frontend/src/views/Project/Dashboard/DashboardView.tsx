import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ApolloError, FetchResult, gql, useMutation, useQuery, RefetchQueriesFunction, ApolloQueryResult } from '@apollo/client'
import { Chip, CircularProgress, Icon, Typography } from '@equinor/eds-core-react'
import ErrorMessage from '../../../components/ErrorMessage'
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks'
import { getCachedRoles } from '../../../utils/helpers'

import { genericErrorMessage } from '../../../utils/Variables'
import { BmtScore, Evaluation, Project, Status } from '../../../api/models'
import { EVALUATION_DASHBOARD_FIELDS_FRAGMENT, PARTICIPANTS_ARRAY_FRAGMENT } from '../../../api/fragments'
import { useEvaluationsWithPortfolio } from '../../../utils/hooks'
import Portfolios from './Components/Portfolios'
import EvaluationsTable from './Components/EvaluationsTable'
import CreateEvaluationButton from './Components/CreateEvaluationButton'
import { centered } from '../../../utils/styles'
import { Grid } from '@mui/material'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'
import { visibility, account_circle } from '@equinor/eds-icons'

const Chips = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 20px;
`

const StyledChip = styled(Chip)`
    cursor: pointer;
    margin-right: 10px;
`

enum TableSelection {
    Portfolio = 'PORTFOLIO',
    Project = 'PROJECT',
    User = 'USER',
    Hidden = 'HIDDEN',
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
        case 'HIDDEN': {
            return (
                <>
                    <Icon data={visibility} size={16} />
                    {`Hidden ${projectLabel} evaluations`}
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
    const hiddenEvaluationsSelected = selectedProjectTable === TableSelection.Hidden
    const portfoliosSelected = selectedProjectTable === TableSelection.Portfolio

    const {
        loading: loadingUserEvaluations,
        evaluations: userEvaluations,
        error: errorUserEvaluations,
    } = useUserEvaluationsQuery(currentUser.localAccountId)

    const {
        loading: loadingProjectEvaluations,
        evaluations: projectEvaluations,
        error: errorProjectEvaluations,
    } = useProjectEvaluationsQuery(project.id, Status.Active)

    const {
        loading: loadingActiveEvaluations,
        evaluations: activeEvaluations,
        error: errorActiveEvaluations,
        refetch: refetchActiveEvaluations,
    } = useAllEvaluationsQuery(Status.Active)

    const {
        loading: loadingHiddenEvaluations,
        evaluations: hiddenEvaluations,
        error: errorHiddenEvaluations,
    } = useAllEvaluationsQuery(Status.Voided)

    const allActiveEvaluationsWithProjectMasterAndPortfolio = useEvaluationsWithPortfolio(activeEvaluations) // TODO: re render when status changes

    const errorMessage = <ErrorMessage title="Error" message={genericErrorMessage} />

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
        }
    }, [currentContext])

    return (
        <Grid container justifyContent="space-between">
            <Grid item>
                <Chips>
                    {Object.values(TableSelection).map(value => {
                        if (
                            (value === TableSelection.Hidden && !userIsAdmin) ||
                            (value === TableSelection.Project && !currentContext) ||
                            (value === TableSelection.Portfolio && currentContext)
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
                <CreateEvaluationButton projectId={project.id} />
                <Typography
                    link
                    href="https://statoilsrm.sharepoint.com/sites/ProjectDevelopmentCenter/SitePages/Products-and-Contact-information.aspx"
                >
                    Order a BMT evaluation through PDC
                </Typography>
            </Grid>
            <Grid item xs={12}>
                {myEvaluationsSelected && (
                    <>
                        {userEvaluations && <EvaluationsTable evaluations={userEvaluations} />}
                        {loadingUserEvaluations && <CenteredCircularProgress />}
                        {errorUserEvaluations !== undefined && errorMessage}
                    </>
                )}
                {projectEvaluationsSelected && (
                    <>
                        {projectEvaluations && <EvaluationsTable evaluations={projectEvaluations} />}
                        {loadingProjectEvaluations && <CenteredCircularProgress />}
                        {errorProjectEvaluations !== undefined && errorMessage}
                    </>
                )}
                {hiddenEvaluationsSelected && (
                    <>
                        {hiddenEvaluations && <EvaluationsTable evaluations={hiddenEvaluations} />}
                        {loadingHiddenEvaluations && <CenteredCircularProgress />}
                        {errorHiddenEvaluations !== undefined && errorMessage}
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
