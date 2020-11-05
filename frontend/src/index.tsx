import * as React from 'react';
import { registerApp, ContextTypes, Context } from '@equinor/fusion';

import { ApolloProvider } from '@apollo/client';

import { useFusionContext } from '@equinor/fusion';

import { client } from './api/graphql';
import App from './App';
import { config } from './config';

const Start = () => {
    const fusionContext = useFusionContext();

    const [hasLoggedIn, setHasLoggedIn] = React.useState(false);
    const login = async () => {
        const isLoggedIn = await fusionContext.auth.container.registerAppAsync(config.AD_APP_ID, [
            new URL(config.API_URL).origin,
        ]);

        if(!isLoggedIn) {
            await fusionContext.auth.container.loginAsync(config.AD_APP_ID);
            return;
        }

        setHasLoggedIn(true);
    };

    React.useEffect(() => {
        login();
    }, []);


    return <>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </>;
};

registerApp('bmt', {
    AppComponent: Start,
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
