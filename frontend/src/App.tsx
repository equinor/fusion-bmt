import React from 'react';

import { useCurrentContext, useCurrentUser } from '@equinor/fusion';
import { Tabs, Tab } from '@equinor/fusion-components';
import GQLButtons from './GraphQL/GQLButtons';

const App = () => {
    const currentProject = useCurrentContext();
    const [activeTabKey, setActiveTabKey] = React.useState('Item1');

    const currentUser = useCurrentUser();

    const changeTabKey = (tabKey: string) => setActiveTabKey(tabKey);

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
        <Tabs activeTabKey={activeTabKey} onChange={changeTabKey}>
            <Tab tabKey="Item1" title="Dashboard">
                <h1>Dashboard</h1>
            </Tab>
            <Tab tabKey="Item2" title="Actions">
                <h1>Actions</h1>
            </Tab>
            <Tab tabKey="Item3" title="Archive">
                <h1>Archive</h1>
            </Tab>
        </Tabs>
    </>
}

export default App;
