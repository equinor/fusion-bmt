import React, { useEffect } from 'react'
import { registerApp, ContextTypes, Context, useAppConfig, useFusionContext, useCurrentUser, useFusionEnvironment } from '@equinor/fusion'
import { createComponent, createLegacyApp } from "@equinor/fusion-framework-react-app"
import { ApolloProvider } from '@apollo/client'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { ReactPlugin } from '@microsoft/applicationinsights-react-js'
import { createBrowserHistory } from 'history'

import { createClient, getToken } from './api/graphql'
import App from './App'
import { config } from './config'

import './styles.css'
import { ResolveConfiguration } from './utils/config'
import { configurator } from './configurator'

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
    const runtimeConfig = useAppConfig()
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

    useEffect(() => {
        (async () => {
            try {
                const scopes = ["api://8829d4ca-93e8-499a-8ce1-bc0ef4840176/user_impersonation"]
                // @ts-ignore
                const token = await window.Fusion.modules.auth.acquireAccessToken({ scopes })

                window.sessionStorage.setItem("token", token ?? "")
            }
            catch (error) {
                console.log("error: ", error)
            }
        })()
    }, [])

    if (!apiUrl) {
        return <>Missing API url</>
    }

    const apolloClient = createClient(apiUrl)

    return (
        <>
            <ApolloProvider client={apolloClient}>
                <App />
            </ApolloProvider>
        </>
    )
}

const render = createComponent(Start, configurator)

registerApp("bmt", {
    AppComponent: Start,
    render,
})

if (module.hot) {
    module.hot.accept()
}

export default render
