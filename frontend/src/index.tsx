import React, { useEffect } from 'react'
import { registerApp, ContextTypes, Context, useAppConfig, useFusionContext, useCurrentUser, useFusionEnvironment } from '@equinor/fusion'
import createApp, { createLegacyApp } from "@equinor/fusion-framework-react-app"
import { ApolloProvider } from '@apollo/client'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { ReactPlugin } from '@microsoft/applicationinsights-react-js'
import { createBrowserHistory } from 'history'

import { createClient } from './api/graphql'
import App from './App'
import { config } from './config'

import './styles.css'
import { ResolveConfiguration } from './utils/config'

const browserHistory = createBrowserHistory()
const reactPlugin = new ReactPlugin()
const appInsights = new ApplicationInsights({
    config: {
        instrumentationKey: config.APP_INSIGHTS,
        extensions: [reactPlugin],
        extensionConfig: {
            [reactPlugin.identifier]: { history: browserHistory },
        },
    },
})

appInsights.loadAppInsights()
appInsights.trackPageView()

const Start = () => {
    const fusionContext = useFusionContext()
    const currentUser = useCurrentUser()
    const runtimeConfig = useAppConfig()
    const [hasLoggedIn, setHasLoggedIn] = React.useState(false)
    const [apiUrl, setApiUrl] = React.useState('')

    const fusionEnvironment = useFusionEnvironment()

    React.useLayoutEffect(() => {
        if (runtimeConfig.value) {
            config.API_URL ? setApiUrl(config.API_URL) : setApiUrl(runtimeConfig.value.endpoints['API_URL'])
        }
        else {
            const config = ResolveConfiguration(fusionEnvironment.env)
            setApiUrl(config.API_URL)
        }
    }, [runtimeConfig])

    // const login = async () => {
    //     const isLoggedIn = await fusionContext.auth.container.registerAppAsync(config.AD_APP_ID, [])

    //     if (!isLoggedIn) {
    //         await fusionContext.auth.container.loginAsync(config.AD_APP_ID)
    //         return
    //     }

    //     setHasLoggedIn(true)
    // }

    // React.useEffect(() => {
    //     login()
    // }, [])

    useEffect(() => {
        (async () => {
            const scopes = ["api://8829d4ca-93e8-499a-8ce1-bc0ef4840176/user_impersonation"]
            const token = await window.Fusion.modules.auth.acquireAccessToken({ scopes })

            window.sessionStorage.setItem("token", token ?? "")
        })()
    }, [])

    if (!apiUrl) {
        return <></>
    }
    // if (!currentUser || !hasLoggedIn) {
    //     return <p>Please log in.</p>
    // }



    const apolloClient = createClient(apiUrl)

    console.log("apolloClient", apolloClient)

    return (
        <>
            <ApolloProvider client={apolloClient}>
                <App />
            </ApolloProvider>
        </>
    )
}

registerApp('bmt', {
    AppComponent: createLegacyApp(Start),
    name: 'Barrier Management Tool',
    context: {
        types: [ContextTypes.ProjectMaster],
        buildUrl: (context: Context | null, url: string) => {
            if (!context) return ''
            return `/${context.id}`
        },
        getContextFromUrl: (url: string) => {
            return url.split('/')[1]
        },
    },
})

if (module.hot) {
    module.hot.accept()
}
