import React from 'react'
import { Chip, CircularProgress, Typography } from '@equinor/eds-core-react'
import { ApolloError, gql, useQuery } from '@apollo/client'
import { Box } from '@material-ui/core'
import { TextArea } from '@equinor/fusion-components'
import { useCurrentUser } from '@equinor/fusion'

import { Evaluation, Project, Status } from '../../../api/models'
import CreateEvaluationButton from './CreateEvaluationButton'
import EvaluationsTable from './EvaluationsTable'
import styled from 'styled-components'
import { EVALUATION_DASHBOARD_FIELDS_FRAGMENT } from '../../../api/fragments'
import { useEvaluationsWithPortfolio } from '../../../utils/hooks'
import Portfolios from './Portfolios'

const Chips = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 20px;
`

const StyledChip = styled(Chip)`
    cursor: pointer;
    margin-right: 10px;
`

const Centered = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
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
        <Centered>
            <CircularProgress />
        </Centered>
    )
}

interface Props {
    project: Project
}

const ProjectDashboardView = ({ project }: Props) => {
    const currentUser = useCurrentUser()
    const userIsAdmin = currentUser && currentUser.roles.includes('Role.Admin')
    const [selectedProjectTable, setSelectedProjectTable] = React.useState<string>(TableSelection.User)
    const userTableSelected = selectedProjectTable === TableSelection.User
    const projectTableSelected = selectedProjectTable === TableSelection.Project
    const hiddenEvaluationsSelected = selectedProjectTable === TableSelection.Hidden
    const portfoliosSelected = selectedProjectTable === TableSelection.Portfolio

    if (!currentUser) {
        return <p>Please log in.</p>
    }

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

    const allActiveEvaluationsWithPortfolio = useEvaluationsWithPortfolio(activeEvaluations)

    if (errorUserEvaluations !== undefined) {
        return (
            <div>
                <TextArea value={`Error in loading evaluations: ${JSON.stringify(errorUserEvaluations)}`} onChange={() => {}} />
            </div>
        )
    }

    if (errorProjectEvaluations !== undefined) {
        return (
            <div>
                <TextArea value={`Error in loading evaluations: ${JSON.stringify(errorProjectEvaluations)}`} onChange={() => {}} />
            </div>
        )
    }

    if (errorHiddenEvaluations !== undefined) {
        return (
            <div>
                <TextArea value={`Error in loading evaluations: ${JSON.stringify(errorHiddenEvaluations)}`} onChange={() => {}} />
            </div>
        )
    }

    if (errorActiveEvaluations !== undefined) {
        return (
            <div>
                <TextArea value={`Error in loading evaluations: ${JSON.stringify(errorActiveEvaluations)}`} onChange={() => {}} />
            </div>
        )
    }

    return (
        <div style={{ margin: 20 }}>
            <CreateEvaluationButton projectId={project.id} />
            <Box marginY={2}>
                <Typography variant="h2">Evaluations</Typography>
            </Box>
            <Chips>
                {Object.values(TableSelection).map(value => {
                    if (value === TableSelection.Hidden && !userIsAdmin) {
                        return undefined
                    } else {
                        return (
                            <StyledChip
                                key={value}
                                variant={selectedProjectTable === value ? 'active' : 'default'}
                                onClick={() => setSelectedProjectTable(value)}
                            >
                                {mapTableSelectionToText(value)}
                            </StyledChip>
                        )
                    }
                })}
            </Chips>
            {userTableSelected && (
                <>
                    {userEvaluations && <EvaluationsTable evaluations={userEvaluations} />}
                    {loadingUserEvaluations && <CenteredCircularProgress />}
                </>
            )}
            {projectTableSelected && (
                <>
                    {projectEvaluations && <EvaluationsTable evaluations={projectEvaluations} />}
                    {loadingProjectEvaluations && <CenteredCircularProgress />}
                </>
            )}
            {hiddenEvaluationsSelected && (
                <>
                    {hiddenEvaluations && <EvaluationsTable evaluations={hiddenEvaluations} />}
                    {loadingHiddenEvaluations && <CenteredCircularProgress />}
                </>
            )}
            {portfoliosSelected && (
                <>
                    {allActiveEvaluationsWithPortfolio && <Portfolios evaluationsWithPortfolio={allActiveEvaluationsWithPortfolio} />}
                    {(loadingActiveEvaluations || !allActiveEvaluationsWithPortfolio) && <CenteredCircularProgress />}
                </>
            )}
        </div>
    )
}

export default ProjectDashboardView

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
