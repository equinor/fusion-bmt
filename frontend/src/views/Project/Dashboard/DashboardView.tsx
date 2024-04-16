import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ApolloError, FetchResult, gql, useMutation, useQuery, RefetchQueriesFunction, ApolloQueryResult } from '@apollo/client'
import { Box } from '@mui/material'
import { Button, Chip, CircularProgress, Typography } from '@equinor/eds-core-react'
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
    Project = 'PROJECT',
    User = 'USER',
    Hidden = 'HIDDEN',
    Portfolio = 'PORTFOLIO',
}

const mapTableSelectionToText = (tableSelection: string) => {
    switch (tableSelection) {
        case 'USER': {
            return 'My evaluations'
        }
        case 'PROJECT': {
            return 'Project evaluations'
        }
        case 'HIDDEN': {
            return 'Hidden evaluations'
        }
        case 'PORTFOLIO': {
            return 'Portfolios'
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
    const currentUser = useCurrentUser()
    //generatedBMTScores is an object
    const [generatedBMTScores, setGeneratedBMTScores] = React.useState<BmtScore[] | undefined>(undefined)

    const { generateBMTScores, loading: loadingProgressEvaluation, error: errorProgressEvaluation } = useGenerateBMTScoresMutation()

    if (!currentUser) {
        return <p>Please log in.</p>
    }

    const [selectedProjectTable, setSelectedProjectTable] = React.useState<string>(TableSelection.Project)
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

    return (
        <div style={{ margin: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <CreateEvaluationButton projectId={project.id} />
                <Typography
                    link
                    href="https://statoilsrm.sharepoint.com/sites/ProjectDevelopmentCenter/SitePages/Products-and-Contact-information.aspx"
                >
                    Order a BMT evaluation through PDC
                </Typography>
            </div>
            <Box marginY={2}>
                <Typography variant="h2">Evaluations</Typography>
            </Box>
            <Chips>
                {Object.values(TableSelection).map(value => {
                    if (value === TableSelection.Hidden && !userIsAdmin) {
                        return undefined
                    } else {
                        return (
                            <div key={value}>
                                <StyledChip
                                    variant={selectedProjectTable === value ? 'active' : 'default'}
                                    onClick={() => setSelectedProjectTable(value)}
                                >
                                    {mapTableSelectionToText(value)}
                                </StyledChip>
                            </div>
                        )
                    }
                })}
            </Chips>
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
        </div>
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
