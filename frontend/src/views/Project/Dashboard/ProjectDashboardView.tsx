import * as React from 'react'

import { Project } from '../../../api/models'
import CreateEvaluationButton from './CreateEvaluationButton'
import EvaluationListItem from './EvaluationListItem'
import { Box } from '@material-ui/core'
import { Typography } from '@equinor/eds-core-react'
import { useEvaluationsQuery } from './ProjectDashboardGQL'
import { TextArea } from '@equinor/fusion-components'

interface ProjectDashboardViewProps {
    project: Project
}

const ProjectDashboardView = ({project}: ProjectDashboardViewProps) => {
    const {loading: loadingQuery, evaluations, error: errorQuery} = useEvaluationsQuery(project.id)

    if (loadingQuery){
        return <>
            Loading...
        </>
    }

    if (errorQuery !== undefined) {
        return <div>
            <TextArea
                value={`Error in loading evaluations: ${JSON.stringify(errorQuery)}`}
                onChange={() => { }}
            />
        </div>
    }

    if (evaluations === undefined){
        return <div>
            <TextArea
                value={`Error in loading evaluations(undefined): ${JSON.stringify(evaluations)}`}
                onChange={() => { }}
            />
        </div>
    }

    return (
        <div style={{margin: 20}}>
            <CreateEvaluationButton projectId={project.id}/>

            {evaluations.length > 0 &&
                <>
                    <Box marginY={2}>
                        <Typography variant="h2">Evaluations in progress</Typography>
                    </Box>
                    {evaluations &&
                        <Box display="flex" flexDirection="column">
                            {evaluations.map(e => {
                                return (
                                    <Box key={e.id}>
                                        <EvaluationListItem evaluation={e}/>
                                    </Box>
                                )
                            })}
                        </Box>
                    }
                </>
            }

        </div>
    )
}

export default ProjectDashboardView
