import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { IFusionContext } from '@equinor/fusion'
import { TokenRefreshLink } from "apollo-link-token-refresh"
import jwt_decode from "jwt-decode"

import { config } from '../config'

interface Token {
    [key: string]: any
}

const FUSION_APP_KEY: string = '74b1613f-f22a-451b-a5c3-1c9391e91e68';

const httpLink = createHttpLink({
    uri: `${config.API_URL}/graphql`
})

const authLink = setContext((_, { headers }) => {
    const token = getToken()
    return {
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : ''
        }
    }
})

const getToken = (): string => {
    const fusionStorageJson = localStorage.getItem(`FUSION_AUTH_CACHE`)
    if (fusionStorageJson === null) {
        throw new Error("Could not find auth token in local storage")
    }
    const fusionStorage = JSON.parse(fusionStorageJson);
    const token = fusionStorage[`FUSION_AUTH_CACHE:${config.AD_APP_ID}:TOKEN`]
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
        const contextStore: {[key: string]: any} = window
        const context: IFusionContext = contextStore[FUSION_APP_KEY]
        return context.auth.container.acquireTokenAsync(config.AD_APP_ID).then(token => {
            // This code might not run since fusion refreshes after acquiring
            return new Response(token)
        })
    },
    handleFetch: (token: string) => {
        // This code might not run since fusion refreshes after acquiring
        // Should save here, but fusion does it.
    }
})

export const client = new ApolloClient({
    link: authLink.concat(refreshLink).concat(httpLink),
    cache: new InMemoryCache()
})
