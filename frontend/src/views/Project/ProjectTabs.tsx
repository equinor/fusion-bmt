import React, { useEffect } from 'react'
import { ApolloError, gql, useQuery } from '@apollo/client'

import { RouteComponentProps } from 'react-router-dom'
import ErrorMessage from '../../components/ErrorMessage'
import { Tabs } from '@equinor/eds-core-react'
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks'

import { Project } from '../../api/models'
import ActionsView from './Actions/ActionsView'
import AdminView from './Admin/AdminView'
import DashboardView from './Dashboard/DashboardView'
import { genericErrorMessage } from '../../utils/Variables'
import { getCachedRoles } from '../../utils/helpers'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'
import { CircularProgress, Grid } from '@mui/material'
import { centered } from '../../utils/styles'

const { List, Tab, Panels, Panel } = Tabs

interface Params {
    fusionProjectId: string
}

const ProjectTabs = ({ match }: RouteComponentProps<Params>) => {
    const currentUser = useCurrentUser()
    const { currentContext } = useModuleCurrentContext()

    const fusionProjectId = currentContext?.id ?? match.params.fusionProjectId
    const externalId = currentContext?.externalId

    const [activeTab, setActiveTab] = React.useState(0)

    const { loading, project, error } = useProjectQuery(fusionProjectId, externalId ?? '')

    const isAdmin = currentUser && getCachedRoles()?.includes('Role.Admin')

    useEffect(() => {
        setActiveTab(0)
    }, [currentContext])

    if (loading) {
        return (
            <div style={centered}>
                <CircularProgress />
            </div>
        )
    }

    if (error !== undefined || project === undefined) {
        return <ErrorMessage title="Could not load project" message={genericErrorMessage} />
    }

    return (
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
            <Grid container justifyContent="center">
                <Grid item>
                    <List>
                        <Tab>Evaluations</Tab>
                        <Tab>My actions</Tab>
                        {isAdmin && !currentContext ? <Tab>Questionnaire editor</Tab> : <></>}
                    </List>
                </Grid>
            </Grid>
            <Panels>
                <Panel>
                    <DashboardView project={project} />
                </Panel>
                <Panel>
                    <ActionsView azureUniqueId={currentUser!.localAccountId} />
                </Panel>
                {isAdmin ? (
                    <Panel>
                        <AdminView />
                    </Panel>
                ) : (
                    <></>
                )}
            </Panels>
        </Tabs>
    )
}

export default ProjectTabs

interface ProjectQueryProps {
    loading: boolean
    project: Project | undefined
    error: ApolloError | undefined
}

const useProjectQuery = (fusionProjectId: string, externalID: string): ProjectQueryProps => {
    const GET_PROJECT = gql`
        query {
            project(fusionProjectID: "${fusionProjectId}", externalID: "${externalID}") {
                id
                fusionProjectId
                externalId
                createDate
            }
        }
    `

    const { loading, data, error } = useQuery<{ project: Project }>(GET_PROJECT)

    return {
        loading,
        project: data?.project,
        error,
    }
}
