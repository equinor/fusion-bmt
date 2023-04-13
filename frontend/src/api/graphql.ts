import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'
import { IFusionContext } from '@equinor/fusion'
import { TokenRefreshLink } from 'apollo-link-token-refresh'
import jwt_decode from 'jwt-decode'
import { config } from '../config'

interface Token {
    [key: string]: any
}

const FUSION_APP_KEY: string = '74b1613f-f22a-451b-a5c3-1c9391e91e68'

const authLink = setContext((_, { headers }) => {
    const token = getToken()
    return {
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : '',
        },
    }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        )

    if (networkError) console.log(`[Network error]: ${networkError}`)
})

const getToken = (): string => {
    return window.sessionStorage.getItem("token") ?? ""
}

const refreshLink = new TokenRefreshLink({
    isTokenValidOrUndefined: () => {
        const token = getToken()
        const decodedToken = jwt_decode(token) as Token
        const isTokenValid: boolean = decodedToken.exp * 1000 > Date.now()
        return isTokenValid
    },
    fetchAccessToken: () => {
        const contextStore: { [key: string]: any } = window
        const context: IFusionContext = contextStore[FUSION_APP_KEY]
        return context.auth.container.acquireTokenAsync(config.AD_APP_ID).then(token => {
            // This code might not run since fusion refreshes after acquiring
            return new Response(token)
        })
    },
    handleFetch: (token: string) => {
        // This code might not run since fusion refreshes after acquiring
        // Should save here, but fusion does it.
    },
})

export const createClient = (apiUrl: string) => {
    console.log("Creating client")
    console.log("authLink", authLink)
    console.log("refreshLink", refreshLink)
    console.log("errorLink", errorLink)
    console.log("apiUrl", apiUrl)
    return new ApolloClient({
        link: authLink
            .concat(refreshLink)
            .concat(errorLink)
            .concat(
                createHttpLink({
                    uri: `${apiUrl}/graphql`,
                })
            ),
        cache: new InMemoryCache(),
    })
}
