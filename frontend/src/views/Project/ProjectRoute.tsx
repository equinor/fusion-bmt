import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { Tabs, Tab, TextArea } from '@equinor/fusion-components'
import ProjectDashboardView from './Dashboard/ProjectDashboardView'
import ProjectActionsView from './Action/ProjectActionsView'
import { ApolloError, gql, useQuery } from '@apollo/client'
import { Project } from '../../api/models'

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

    const { loading, data, error } = useQuery<{project: Project}>(
        GET_PROJECT
    )

    return {
        loading,
        project: data?.project,
        error
    }
}

interface Params {
    fusionProjectId: string
}

const ProjectRoute = ({match}: RouteComponentProps<Params>) => {
    const fusionProjectId = match.params.fusionProjectId

    const [activeTabKey, setActiveTabKey] = React.useState('dashboard')
    const changeTabKey = (tabKey: string) => setActiveTabKey(tabKey)
    const {loading, project, error} = useProjectQuery(fusionProjectId)

    if(loading){
        return <>
            Loading...
        </>
    }

    if(error !== undefined || project === undefined){
        return <div>
            <TextArea
                value={JSON.stringify(error)}
                disabled={false}
                onChange={() => {}}
            />
        </div>
    }

    return (
        <Tabs activeTabKey={activeTabKey} onChange={changeTabKey}>
            <Tab tabKey="dashboard" title="Dashboard">
                <ProjectDashboardView project={project} />
            </Tab>
            <Tab tabKey="actions" title="Actions">
                <ProjectActionsView />
            </Tab>
            <Tab tabKey="archive" title="Archive">
                <h1>Archive</h1>
            </Tab>
        </Tabs>
    )
}

export default ProjectRoute
