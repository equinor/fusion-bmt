import React from 'react'

import { useCurrentContext } from '@equinor/fusion'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import ProjectTabs from './views/Project/ProjectTabs'
import EvaluationView from './views/Evaluation/EvaluationView'

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
            <BrowserRouter>
                <Switch>
                    <Route path="/:fusionProjectId" exact component={ProjectTabs} />
                    <Route path="/apps/bmt/:fusionProjectId" exact component={ProjectTabs} />
                    <Route path="/:fusionProjectId/evaluation/:evaluationId" exact component={EvaluationView} />
                    <Route path="/apps/bmt/:fusionProjectId/evaluation/:evaluationId" exact component={EvaluationView} />
                    <Route path="/" component={ProjectTabs} />
                </Switch>
            </BrowserRouter>
        </>
    )
}

export default App
