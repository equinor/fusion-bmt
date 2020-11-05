import * as React from 'react';
import { Tabs, Tab, TextArea } from '@equinor/fusion-components';
import ProjectDashboardView from '../views/Project/ProjectDashboardView';
import ProjectActionsView from '../views/Project/ProjectActionsView';
import { gql, useQuery } from '@apollo/client';
import { Project } from '../api/models';

interface ProjectHomeRouteProps {
    projectID: string
}

const ProjectHomeRoute = ({projectID}: ProjectHomeRouteProps) => {
    const [activeTabKey, setActiveTabKey] = React.useState('Item1');
    const changeTabKey = (tabKey: string) => setActiveTabKey(tabKey);

    const GET_PROJECT = gql`
        query {
            project(fusionProjectID: "${projectID}") {
                createDate
                fusionProjectId
            }
        }
    `;

    const { loading, data, error } = useQuery<{project: Project}>(
        GET_PROJECT
    );

    if(loading){
        return <>
            Loading...
        </>
    }

    if(error !== undefined){
        return <div>
            <TextArea
                label={JSON.stringify(error)}
                disabled={true}
                onChange={() => {}}
            />
        </div>
    }

    return (
        <Tabs activeTabKey={activeTabKey} onChange={changeTabKey}>
            <Tab tabKey="Item1" title="Dashboard">
                <ProjectDashboardView project={data!.project} />
            </Tab>
            <Tab tabKey="Item2" title="Actions">
                <ProjectActionsView />
            </Tab>
            <Tab tabKey="Item3" title="Archive">
                <h1>Archive</h1>
            </Tab>
        </Tabs>
    );
};

export default ProjectHomeRoute;
