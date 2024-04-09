import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'
import { TokenRefreshLink } from 'apollo-link-token-refresh'
import jwt_decode from 'jwt-decode'

interface Token {
    [key: string]: any
}

const FUSION_APP_KEY: string = '74b1613f-f22a-451b-a5c3-1c9391e91e68'

const authLink = setContext(async (_, { headers }) => {
    const token = await getToken()
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

export const getToken = async (): Promise<string> => {
    const scopes = ["api://8829d4ca-93e8-499a-8ce1-bc0ef4840176/user_impersonation"]
    // @ts-ignore
    const token = await window.Fusion.modules.auth.acquireAccessToken({ scopes })
    return token ?? ""
}

const refreshLink = new TokenRefreshLink({
    isTokenValidOrUndefined: async () => {
        const token = await getToken()
        const decodedToken = jwt_decode(token) as Token
        const isTokenValid: boolean = decodedToken.exp * 1000 > Date.now()
        return isTokenValid
    },
    fetchAccessToken: () => {
        const contextStore: { [key: string]: any } = window
        return new Promise(() => getToken())
    },
    handleFetch: (token: string) => {
        // This code might not run since fusion refreshes after acquiring
        // Should save here, but fusion does it.
    },
})

export const createClient = (apiUrl: string) => {
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
