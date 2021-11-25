import React from 'react'
import { ApolloError, gql, useQuery } from '@apollo/client'

import { RouteComponentProps } from 'react-router-dom'
import { ErrorMessage } from '@equinor/fusion-components'
import { CircularProgress, Tabs } from '@equinor/eds-core-react'
import { useCurrentUser } from '@equinor/fusion'

import { Project } from '../../api/models'
import { ProjectContext } from '../../globals/contexts'
import { StyledTabPanel } from '../../components/StyledTabs'
import ActionsView from './Actions/ActionsView'
import AdminView from './Admin/AdminView'
import DashboardView from './Dashboard/DashboardView'
import { genericErrorMessage } from '../../utils/Variables'

const { List, Tab, Panels } = Tabs

interface Params {
    fusionProjectId: string
}

const ProjectRoute = ({ match }: RouteComponentProps<Params>) => {
    const currentUser = useCurrentUser()
    const fusionProjectId = match.params.fusionProjectId

    const [activeTab, setActiveTab] = React.useState(0)
    const { loading, project, error } = useProjectQuery(fusionProjectId)

    const isAdmin = currentUser && currentUser.roles.includes('Role.Admin')

    if (loading) {
        return <>Loading...</>
    }

    if (error !== undefined || project === undefined) {
        return <ErrorMessage hasError errorType={'noData'} title="Could not load project" message={genericErrorMessage} />
    }

    return (
        <ProjectContext.Provider value={project}>
            <Tabs activeTab={activeTab} onChange={setActiveTab}>
                <List>
                    <Tab>Dashboard</Tab>
                    <Tab>Actions</Tab>
                    {isAdmin ? <Tab>Admin</Tab> : <></>}
                </List>
                <Panels>
                    <StyledTabPanel>
                        <DashboardView project={project} />
                    </StyledTabPanel>
                    <StyledTabPanel>
                        <ActionsView azureUniqueId={currentUser!.id} />
                    </StyledTabPanel>
                    {isAdmin ? (
                        <StyledTabPanel>
                            <AdminView />
                        </StyledTabPanel>
                    ) : (
                        <></>
                    )}
                </Panels>
            </Tabs>
        </ProjectContext.Provider>
    )
}

export default ProjectRoute

interface ProjectQueryProps {
    loading: boolean
    project: Project | undefined
    error: ApolloError | undefined
}

const useProjectQuery = (fusionProjectId: string): ProjectQueryProps => {
    const GET_PROJECT = gql`
        query {
            project(fusionProjectID: "${fusionProjectId}") {
                id
                fusionProjectId
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
