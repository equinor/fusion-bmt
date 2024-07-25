import React, { createElement, useEffect } from 'react'
import { createRoot } from "react-dom/client"
import { ComponentRenderArgs, makeComponent } from "@equinor/fusion-framework-react-app"
import { ApolloProvider } from '@apollo/client'
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev"
import { configure } from "./config"

import { createClient } from './api/graphql'
import App from './App'

import './styles.css'
import { resolveConfiguration } from './environmentConfig'
import { EnvironmentVariables } from './environmentVariables'

import { AppContextProvider } from './context/AppContext'

const Start = () => {
    const [apiUrl, setApiUrl] = React.useState('')

    React.useLayoutEffect(() => {
        const config = resolveConfiguration(EnvironmentVariables.ENVIRONMENT)
        setApiUrl(config.REACT_APP_API_BASE_URL)
    }, [])

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

    loadDevMessages();
    loadErrorMessages();

    const apolloClient = createClient(apiUrl)

    return (
        <>
            <ApolloProvider client={apolloClient}>
                <AppContextProvider>
                    <App />
                </AppContextProvider>
            </ApolloProvider>
        </>
    )
}

const appComponent = createElement(Start)

const createApp = (args: ComponentRenderArgs) => makeComponent(appComponent, args, configure)

export const renderApp = (el: HTMLElement, args: ComponentRenderArgs) => {
    const app = createApp(args)
    const root = createRoot(el)
    root.render(createElement(app))
    return () => root.unmount()
}

export default renderApp
