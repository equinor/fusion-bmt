import React from 'react'
import { ApolloError, gql, useQuery } from '@apollo/client'

import { RouteComponentProps } from 'react-router-dom'
import { TextArea } from '@equinor/fusion-components'
import { Tabs } from '@equinor/eds-core-react'
import { useCurrentUser } from '@equinor/fusion'

import ProjectDashboardView from './Dashboard/ProjectDashboardView'
import { ProjectContext } from '../../globals/contexts'
import { StyledTabPanel } from '../../components/StyledTabs'
import { apiErrorMessage } from '../../api/error'
import ActionTableForOneUserWithApi from '../../components/ActionTable/ActionTableForOneUserWithApi'
import { Project } from '../../api/models'
import AdminView from '../Admin/AdminView'

const { TabList, Tab, TabPanels } = Tabs

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
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not load project')} onChange={() => {}} />
            </div>
        )
    }

    return (
        <ProjectContext.Provider value={project}>
            <Tabs activeTab={activeTab} onChange={setActiveTab}>
                <TabList>
                    <Tab>Dashboard</Tab>
                    <Tab>Actions</Tab>
                    {isAdmin ? <Tab>Admin</Tab> : <></>}
                </TabList>
                <TabPanels>
                    <StyledTabPanel>
                        <ProjectDashboardView project={project} />
                    </StyledTabPanel>
                    <StyledTabPanel>
                        <ActionTableForOneUserWithApi azureUniqueId={currentUser!.id} />
                    </StyledTabPanel>
                    {isAdmin ? (
                        <StyledTabPanel>
                            <AdminView />
                        </StyledTabPanel>
                    ) : (
                        <></>
                    )}
                </TabPanels>
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
