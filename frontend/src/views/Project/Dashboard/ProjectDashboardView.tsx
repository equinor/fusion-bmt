import React from 'react'

import { Project } from '../../../api/models'
import CreateEvaluationButton from './CreateEvaluationButton'
import { Box } from '@material-ui/core'
import { Typography } from '@equinor/eds-core-react'
import { useEvaluationsQuery } from './ProjectDashboardGQL'
import { TextArea } from '@equinor/fusion-components'
import { useCurrentUser } from '@equinor/fusion'
import { apiErrorMessage } from '../../../api/error'
import EvaluationsTable from './EvaluationsTable'

interface ProjectDashboardViewProps {
    project: Project
}

const ProjectDashboardView = ({ project }: ProjectDashboardViewProps) => {
    const currentUser = useCurrentUser()
    if (!currentUser) {
        return <p>Please log in.</p>
    }

    const { loading: loadingQuery, evaluations, error: errorQuery } = useEvaluationsQuery(project.id, currentUser.id)

    if (loadingQuery) {
        return <>Loading...</>
    }

    if (errorQuery !== undefined || evaluations === undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not load evaluations')} onChange={() => {}} />
            </div>
        )
    }

    return (
        <div style={{ margin: 20 }}>
            <CreateEvaluationButton projectId={project.id} />

            {evaluations.length > 0 && (
                <>
                    <Box marginY={2}>
                        <Typography variant="h2">Evaluations</Typography>
                    </Box>
                    {evaluations && (
                        <Box display="flex" flexDirection="column">
                            <EvaluationsTable
                                evaluations={evaluations.filter(e => e.participants.map(p => p.azureUniqueId).includes(currentUser.id))}
                            />
                        </Box>
                    )}
                </>
            )}
        </div>
    )
}

export default ProjectDashboardView
