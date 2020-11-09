import React from 'react';

import { useCurrentContext, useCurrentUser } from '@equinor/fusion';
import GQLButtons from './GraphQL/GQLButtons';
import { Switch, Route } from 'react-router-dom';
import ProjectRoute from './routes/ProjectRoute';
import EvaluationRoute from './routes/EvaluationRoute';

const App = () => {
    const currentProject = useCurrentContext();

    const currentUser = useCurrentUser();

    if(!currentUser){
        return <p>Please log in.</p>
    }

    if(!currentProject){
        return <>
            <p>Please select a project.</p>
            <GQLButtons />
        </>
    }

    return <>
        <Switch>
            <Route path="/:fusionProjectId" exact component={ProjectRoute} />
            <Route path="/:fusionProjectId/evaluation/:evaluationId" exact component={EvaluationRoute} />
        </Switch>
    </>
}

export default App;
