import React from 'react'
import { ApolloError, gql, useQuery } from '@apollo/client'

import { RouteComponentProps } from 'react-router-dom'
import ErrorMessage from '../../components/ErrorMessage'
import { Tabs } from '@equinor/eds-core-react'
import { useCurrentContext, useCurrentUser } from '@equinor/fusion'

import { Project } from '../../api/models'
import { ProjectContext } from '../../globals/contexts'
import { StyledTabPanel } from '../../components/StyledTabs'
import ActionsView from './Actions/ActionsView'
import AdminView from './Admin/AdminView'
import DashboardView from './Dashboard/DashboardView'
import { genericErrorMessage } from '../../utils/Variables'
import { getCachedRoles } from '../../utils/helpers'

const { List, Tab, Panels } = Tabs

interface Params {
    fusionProjectId: string
}

const ProjectTabs = ({ match }: RouteComponentProps<Params>) => {
    const currentUser = useCurrentUser()
    const currentProject = useCurrentContext()

    const fusionProjectId = currentProject?.id ?? match.params.fusionProjectId
    const externalId = currentProject?.externalId

    const [activeTab, setActiveTab] = React.useState(0)

    const { loading, project, error } = useProjectQuery(fusionProjectId, externalId ?? '')

    const isAdmin = currentUser && getCachedRoles()?.includes('Role.Admin')

    if (!currentProject) {
        return (
            <>
                <p>Please select a project.</p>
            </>
        )
    }

    if (loading) {
        return <>Loading...</>
    }

    if (error !== undefined || project === undefined) {
        return <ErrorMessage title="Could not load project" message={genericErrorMessage} />
    }

    return (
        <ProjectContext.Provider value={project}>
            <Tabs activeTab={activeTab} onChange={setActiveTab}>
                <List>
                    <Tab>Dashboard</Tab>
                    <Tab>Actions</Tab>
                    <Tab>Admin</Tab>
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
