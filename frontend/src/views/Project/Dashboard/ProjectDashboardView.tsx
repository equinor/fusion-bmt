import React from 'react'
import { CircularProgress, Typography } from '@equinor/eds-core-react'
import { ApolloError, gql, useQuery } from '@apollo/client'
import { Box } from '@material-ui/core'
import { TextArea } from '@equinor/fusion-components'
import { Chip } from '@equinor/eds-core-react'
import { useCurrentUser } from '@equinor/fusion'

import { Evaluation, Project, Status } from '../../../api/models'
import CreateEvaluationButton from './CreateEvaluationButton'
import EvaluationsTable from './EvaluationsTable'
import styled from 'styled-components'

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

    if (!currentUser) {
        return <p>Please log in.</p>
    }

    const { loading: loadingUserEvaluations, evaluations: userEvaluations, error: errorUserEvaluations } = useUserEvaluationsQuery(
        currentUser.id
    )
    const { loading: loadingProjectEvaluations, evaluations, error: errorProjectEvaluations } = useGetAllEvaluationsQuery(project.id)

    const projectEvaluations = evaluations ? evaluations.filter(evaluation => evaluation.status === Status.Active) : []
    const hiddenEvaluations = evaluations ? evaluations.filter(evaluation => evaluation.status === Status.Voided) : []

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
                    <EvaluationsTable evaluations={projectEvaluations} />
                    {loadingProjectEvaluations && <CenteredCircularProgress />}
                </>
            )}
            {hiddenEvaluationsSelected && <EvaluationsTable evaluations={hiddenEvaluations} />}
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
        query($azureUniqueId: String!) {
            evaluations(where: { participants: { some: { azureUniqueId: { eq: $azureUniqueId } } }, status: {eq: ${Status.Active}} }) {
                id
                name
                progression
                createDate
                status
                questions {
                    id
                    barrier
                    answers {
                        id
                        severity
                        progression
                    }
                    actions {
                        id
                        dueDate
                        completed
                    }
                }
            }
        }
    `

    const { loading, data, error } = useQuery<{ evaluations: Evaluation[] }>(GET_EVALUATIONS, { variables: { azureUniqueId } })

    return {
        loading,
        evaluations: data?.evaluations,
        error,
    }
}

export const useGetAllEvaluationsQuery = (projectId: string): EvaluationQueryProps => {
    const GET_EVALUATIONS = gql`
        query($projectId: String!) {
            evaluations(where: { project: { id: { eq: $projectId } } }) {
                id
                name
                progression
                createDate
                status
                questions {
                    id
                    barrier
                    answers {
                        id
                        severity
                        progression
                    }
                    actions {
                        id
                        dueDate
                        completed
                    }
                }
            }
        }
    `

    const { loading, data, error } = useQuery<{ evaluations: Evaluation[] }>(GET_EVALUATIONS, { variables: { projectId } })

    return {
        loading,
        evaluations: data?.evaluations,
        error,
    }
}
