import React from 'react'
import styled from 'styled-components'
import { ApolloError, gql, useQuery } from '@apollo/client'
import { Box } from '@material-ui/core'
import { Chip, CircularProgress, Typography } from '@equinor/eds-core-react'
import { ApplicationGuidanceAnchor, ErrorMessage } from '@equinor/fusion-components'
import { useCurrentUser } from '@equinor/fusion'

import { genericErrorMessage } from '../../../utils/Variables'
import { Evaluation, Project, Status } from '../../../api/models'
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
    User = 'USER',
    Project = 'PROJECT',
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

    if (!currentUser) {
        return <p>Please log in.</p>
    }

    const [selectedProjectTable, setSelectedProjectTable] = React.useState<string>(TableSelection.User)
    const userIsAdmin = currentUser && currentUser.roles.includes('Role.Admin')
    const myEvaluationsSelected = selectedProjectTable === TableSelection.User
    const projectEvaluationsSelected = selectedProjectTable === TableSelection.Project
    const hiddenEvaluationsSelected = selectedProjectTable === TableSelection.Hidden
    const portfoliosSelected = selectedProjectTable === TableSelection.Portfolio

    const {
        loading: loadingUserEvaluations,
        evaluations: userEvaluations,
        error: errorUserEvaluations,
    } = useUserEvaluationsQuery(currentUser.id)

    const {
        loading: loadingProjectEvaluations,
        evaluations: projectEvaluations,
        error: errorProjectEvaluations,
    } = useProjectEvaluationsQuery(project.id, Status.Active)

    const {
        loading: loadingActiveEvaluations,
        evaluations: activeEvaluations,
        error: errorActiveEvaluations,
    } = useAllEvaluationsQuery(Status.Active)

    const {
        loading: loadingHiddenEvaluations,
        evaluations: hiddenEvaluations,
        error: errorHiddenEvaluations,
    } = useAllEvaluationsQuery(Status.Voided)

    const allActiveEvaluationsWithProjectMasterAndPortfolio = useEvaluationsWithPortfolio(activeEvaluations)

    const errorMessage = <ErrorMessage hasError errorType={'noData'} message={genericErrorMessage} />

    return (
        <div style={{ margin: 20 }}>
            <ApplicationGuidanceAnchor anchor={'dashboard-create-evaluations-button'} scope="bmt">
                <CreateEvaluationButton projectId={project.id} />
            </ApplicationGuidanceAnchor>
            <Box marginY={2}>
                <Typography variant="h2">Evaluations</Typography>
            </Box>
            <Chips>
                {Object.values(TableSelection).map(value => {
                    if (value === TableSelection.Hidden && !userIsAdmin) {
                        return undefined
                    } else {
                        return (
                            <ApplicationGuidanceAnchor anchor={'dashboard-evaluations-filter-' + value} scope="bmt" key={value}>
                                <StyledChip
                                    variant={selectedProjectTable === value ? 'active' : 'default'}
                                    onClick={() => setSelectedProjectTable(value)}
                                >
                                    {mapTableSelectionToText(value)}
                                </StyledChip>
                            </ApplicationGuidanceAnchor>
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
                        <Portfolios evaluationsWithProjectMasterAndPortfolio={allActiveEvaluationsWithProjectMasterAndPortfolio} />
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

    const { loading, data, error } = useQuery<{ evaluations: Evaluation[] }>(GET_EVALUATIONS, { variables: { status } })

    return {
        loading,
        evaluations: data?.evaluations,
        error,
    }
}
