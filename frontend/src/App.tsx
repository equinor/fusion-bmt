import React from 'react'

import { ErrorBoundary } from '@equinor/fusion-components'

import { useCurrentContext } from '@equinor/fusion'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import ProjectTabs from './views/Project/ProjectTabs'
import EvaluationView from './views/Evaluation/EvaluationView'
import Test from './views/Test'

const App = () => {
    const currentProject = useCurrentContext()

    console.log("currentProject in App.tsx: ", currentProject)

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
                <BrowserRouter>
                    <Switch>
                        <Route path="/apps/bmt/:fusionProjectId" exact component={ProjectTabs} />
                        <Route path="/apps/bmt/:fusionProjectId/evaluation/:evaluationId" exact component={EvaluationView} />
                        <Route path="/" component={Test} />
                    </Switch>
                </BrowserRouter>
            </ErrorBoundary>
        </>
    )
}

export default App
