import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

import { config } from '../config'

const httpLink = createHttpLink({
    uri: `${config.API_URL}/graphql`
})

const authLink = setContext((_, { headers }) => {
    const fusionStorageJson = localStorage.getItem('FUSION_AUTH_CACHE')
    if (fusionStorageJson === null) {
        throw new Error('Could not find auth token in local storage')
    }
    const fusionStorage = JSON.parse(fusionStorageJson)
    const token = fusionStorage['FUSION_AUTH_CACHE:8829d4ca-93e8-499a-8ce1-bc0ef4840176:TOKEN']
    return {
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : ''
        }
    }
})

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
})
