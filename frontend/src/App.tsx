import React from 'react'

import { useCurrentContext, useCurrentUser } from '@equinor/fusion'
import { Switch, Route } from 'react-router-dom'
import ProjectRoute from './routes/ProjectRoute'
import EvaluationRoute from './routes/EvaluationRoute'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { ReactPlugin, withAITracking } from '@microsoft/applicationinsights-react-js'
import { createBrowserHistory } from "history"

const browserHistory = createBrowserHistory({ basename: '' })
const reactPlugin = new ReactPlugin()
const appInsights = new ApplicationInsights({
    config: {
        instrumentationKey: '6f08fb54-d348-44cb-9fa6-be2c9e29d419',
        extensions: [reactPlugin],
        extensionConfig: {
            [reactPlugin.identifier]: {history: browserHistory}
        }
    }
})
appInsights.loadAppInsights()

const App = () => {
    const currentProject = useCurrentContext()

    const currentUser = useCurrentUser()

    if(!currentUser){
        return <p>Please log in.</p>
    }

    if(!currentProject){
        return <>
            <p>Please select a project.</p>
        </>
    }

    return <>
        <Switch>
            <Route path="/:fusionProjectId" exact component={ProjectRoute} />
            <Route path="/:fusionProjectId/evaluation/:evaluationId" exact component={EvaluationRoute} />
        </Switch>
    </>
}

export default withAITracking(reactPlugin, App)
