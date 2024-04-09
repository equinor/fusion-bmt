import React from 'react'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import ProjectTabs from './views/Project/ProjectTabs'
import EvaluationView from './views/Evaluation/EvaluationView'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'

const App = () => {
    const { currentContext } = useModuleCurrentContext()

    if (!currentContext?.externalId) {
        return (
            <>
                <p>Please select a project.</p>
            </>
        )
    }

    return (
        <BrowserRouter>
            <Switch>
                <Route path="/:fusionProjectId" exact component={ProjectTabs} />
                <Route path="/apps/bmt/:fusionProjectId" exact component={ProjectTabs} />
                <Route path="/:fusionProjectId/evaluation/:evaluationId" exact component={EvaluationView} />
                <Route path="/apps/bmt/:fusionProjectId/evaluation/:evaluationId" exact component={EvaluationView} />
                <Route path="/" component={ProjectTabs} />
            </Switch>
        </BrowserRouter>
    )
}

export default App
