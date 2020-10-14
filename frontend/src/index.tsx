import * as React from 'react';
import { registerApp, useCurrentContext, ContextTypes, Context } from '@equinor/fusion';
import { Tabs, Tab } from '@equinor/fusion-components';

const App: React.FC = () => {
    const currentProject = useCurrentContext();
    const [activeTabKey, setActiveTabKey] = React.useState('Item1');

    const changeTabKey = (tabKey: string) => setActiveTabKey(tabKey);

    if (!currentProject) {
        return <p>Please select a project.</p>
    }

    return (
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
    );
};

registerApp('bmt', {
    AppComponent: App,
    name: "Barrier Management Tool",
    context: {
        types: [ContextTypes.Project],
        buildUrl: (context: Context | null, url: string) => {
            if (!context) return '';
            return `/${context.id}`;
        },
        getContextFromUrl: (url: string) => {
            return url.split('/')[0];
        },
    },
});

if (module.hot) {
    module.hot.accept();
}
