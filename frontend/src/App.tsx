import React from 'react'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import ProjectTabs from './views/Project/ProjectTabs'
import EvaluationView from './views/Evaluation/EvaluationView'
import { Grid } from '@mui/material'
import Header from './components/Header/Header'

const App = () => {
    return (
        <BrowserRouter>
            <Grid container gap={4} sx={{ padding: '1rem' }} justifyContent="stretch" alignContent="flex-start">
                <Grid item xs={12}>
                    <Header />
                </Grid>
                <Grid item xs={12}>
                    <Switch>
                        <Route path="/:fusionProjectId" exact component={ProjectTabs} />
                        <Route path="/apps/bmt/:fusionProjectId" exact component={ProjectTabs} />
                        <Route path="/:fusionProjectId/evaluation/:evaluationId" exact component={EvaluationView} />
                        <Route path="/apps/bmt/:fusionProjectId/evaluation/:evaluationId" exact component={EvaluationView} />
                        <Route path="/" component={ProjectTabs} />
                    </Switch>
                </Grid>
            </Grid>
        </BrowserRouter>
    )
}

export default App
