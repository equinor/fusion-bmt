import * as React from 'react';
import { Tabs, Tab } from '@equinor/fusion-components';
import ProjectDashboardView from '../views/Project/ProjectDashboardView';
import ProjectActionsView from '../views/Project/ProjectActionsView';

interface ProjectHomeRouteProps {
    projectID: string
}

const ProjectHomeRoute = ({projectID}: ProjectHomeRouteProps) => {
    const [activeTabKey, setActiveTabKey] = React.useState('Item1');
    const changeTabKey = (tabKey: string) => setActiveTabKey(tabKey);


    return (
        <>
        <Tabs activeTabKey={activeTabKey} onChange={changeTabKey}>
            <Tab tabKey="Item1" title="Dashboard">
                <ProjectDashboardView projectID={projectID} />
            </Tab>
            <Tab tabKey="Item2" title="Actions">
                <ProjectActionsView />
            </Tab>
            <Tab tabKey="Item3" title="Archive">
                <h1>Archive</h1>
            </Tab>
        </Tabs>

        </>
    );
};

export default ProjectHomeRoute;
