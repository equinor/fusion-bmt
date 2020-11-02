import React from 'react';

import { useCurrentContext, useCurrentUser } from '@equinor/fusion';
import GQLButtons from './GraphQL/GQLButtons';
import { Switch, Route } from 'react-router-dom';
import ProjectHomeRoute from './routes/ProjectHomeRoute';
import CreateEvaluationRoute from './routes/CreateEvaluationRoute';

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
            <Route path="/:projectID" exact render={() => <ProjectHomeRoute projectID={currentProject.id} />} />
            <Route path="/:projectID/createEvaluation" exact render={() => <CreateEvaluationRoute projectID={currentProject.id} />} />
        </Switch>
    </>
}

export default App;
