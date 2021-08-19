import React from 'react'
import { CircularProgress, Typography } from '@equinor/eds-core-react'
import { ApolloError, gql, useQuery } from '@apollo/client'
import { Box } from '@material-ui/core'
import { TextArea } from '@equinor/fusion-components'
import { Chip } from '@equinor/eds-core-react'
import { useCurrentUser } from '@equinor/fusion'

import { Evaluation, Project } from '../../../api/models'
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
    const [selectedProjectTable, setSelectedProjectTable] = React.useState<string>(TableSelection.User)
    const userTableSelected = selectedProjectTable === TableSelection.User
    const projectTableSelected = selectedProjectTable === TableSelection.Project

    if (!currentUser) {
        return <p>Please log in.</p>
    }

    const { loading: loadingUserEvaluations, evaluations: userEvaluations, error: errorUserEvaluations } = useUserEvaluationsQuery(
        currentUser.id
    )
    const {
        loading: loadingProjectEvaluations,
        evaluations: projectEvaluations,
        error: errorProjectEvaluations,
    } = useGetAllEvaluationsQuery(project.id)

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
                <StyledChip
                    variant={selectedProjectTable === TableSelection.User ? 'active' : 'default'}
                    onClick={() => setSelectedProjectTable(TableSelection.User)}
                >
                    My evaluations
                </StyledChip>
                <StyledChip
                    variant={selectedProjectTable === TableSelection.Project ? 'active' : 'default'}
                    onClick={() => setSelectedProjectTable(TableSelection.Project)}
                >
                    Project evaluations
                </StyledChip>
            </Chips>
            {userTableSelected && (
                <>
                    {userEvaluations && <EvaluationsTable evaluations={userEvaluations || []} />}
                    {loadingUserEvaluations && <CenteredCircularProgress />}
                </>
            )}
            {projectTableSelected && (
                <>
                    {projectEvaluations && <EvaluationsTable evaluations={projectEvaluations || []} />}
                    {loadingProjectEvaluations && <CenteredCircularProgress />}
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
        query($azureUniqueId: String!) {
            evaluations(where: { participants: { some: { azureUniqueId: { eq: $azureUniqueId } } } }) {
                id
                name
                progression
                createDate
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
