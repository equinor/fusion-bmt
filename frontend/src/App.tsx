import React from 'react';

import { useCurrentContext, useCurrentUser } from '@equinor/fusion';
import GQLButtons from './GraphQL/GQLButtons';
import { Switch, Route } from 'react-router-dom';
import ProjectHomeRoute from './routes/ProjectHomeRoute';
import CreateEvaluationRoute from './routes/CreateEvaluationRoute';
import PreparationRoute from './routes/PreparationRoute';

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
            <Route path="/:projectID" exact>
                <ProjectHomeRoute projectID={currentProject.id} />
            </Route>
            <Route path="/:projectID/createEvaluation" exact>
                <CreateEvaluationRoute projectID={currentProject.id} />
            </Route>
            <Route path="/:projectID/preparation" exact>
                <PreparationRoute />
            </Route>
        </Switch>
    </>
}

export default App;
