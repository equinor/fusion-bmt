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
    console.log("getToken")
    const fusionStorageJson = localStorage.getItem(`FUSION_AUTH_CACHE`)
    console.log("getToken fusionStorageJson", fusionStorageJson)
    if (fusionStorageJson === null) {
        console.log("fusionStorageJson === null")
        throw new Error('Could not find auth token in local storage')
    }

    const fusionStorage = JSON.parse(fusionStorageJson)
    console.log("fusionStorage", fusionStorage)
    const token = fusionStorage[`FUSION_AUTH_CACHE:5a842df8-3238-415d-b168-9f16a6a6031b:TOKEN`]
    console.log("getToken token: ", token)
    const scopes = ["api://8829d4ca-93e8-499a-8ce1-bc0ef4840176/user_impersonation"]
    return window.sessionStorage.getItem("token") ?? ""
    return token
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

export const createClient = (apiUrl: string) =>
    new ApolloClient({
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
