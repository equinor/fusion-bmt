import React from 'react'

import { RouteComponentProps } from 'react-router-dom'
import { Tabs, Tab, TextArea } from '@equinor/fusion-components'
import { ApolloError, gql, useQuery } from '@apollo/client'

import ProjectDashboardView from './Dashboard/ProjectDashboardView'
import { Project } from '../../api/models'
import { ProjectContext } from '../../globals/contexts'

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

interface Params {
    fusionProjectId: string
}

const ProjectRoute = ({ match }: RouteComponentProps<Params>) => {
    const fusionProjectId = match.params.fusionProjectId

    const [activeTabKey, setActiveTabKey] = React.useState('dashboard')
    const changeTabKey = (tabKey: string) => setActiveTabKey(tabKey)
    const { loading, project, error } = useProjectQuery(fusionProjectId)

    if (loading) {
        return <>Loading...</>
    }

    if (error !== undefined || project === undefined) {
        return (
            <div>
                <TextArea value={JSON.stringify(error)} disabled={false} onChange={() => {}} />
            </div>
        )
    }

    return (
        <ProjectContext.Provider value={project}>
            <Tabs activeTabKey={activeTabKey} onChange={changeTabKey}>
                <Tab tabKey="dashboard" title="Dashboard">
                    <ProjectDashboardView project={project} />
                </Tab>
            </Tabs>
        </ProjectContext.Provider>
    )
}

export default ProjectRoute
