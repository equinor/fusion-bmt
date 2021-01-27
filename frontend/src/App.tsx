import React from 'react'

import { ErrorBoundary } from '@equinor/fusion-components'

import { useCurrentContext } from '@equinor/fusion'
import { Switch, Route } from 'react-router-dom'
import ProjectRoute from './views/Project/ProjectRoute'
import EvaluationRoute from './views/Evaluation/EvaluationRoute'

const App = () => {
    const currentProject = useCurrentContext()

    if (!currentProject) {
        return (
            <>
                <p>Please select a project.</p>
            </>
        )
    }

    return (
        <>
            <ErrorBoundary>
                <Switch>
                    <Route path="/:fusionProjectId" exact component={ProjectRoute} />
                    <Route path="/:fusionProjectId/evaluation/:evaluationId" exact component={EvaluationRoute} />
                </Switch>
            </ErrorBoundary>
        </>
    )
}

export default App
