import jwtDecode, { JwtPayload } from 'jwt-decode'
import { User } from '../mock/external/users'

const SERVER_URL = Cypress.env('AUTH_URL') || 'http://localhost:8080'
const ISSUER = 'common'
const CACHE_ENTRY = 'FUSION_AUTH_CACHE'

/* TODO: figure out if we want to retrieve token before each test,
 * or if we are able to store tokens of all users we need (or all users at all)
 */
export const getToken = (): string => {
    const fusionStorageJson = localStorage.getItem(CACHE_ENTRY)
    if (fusionStorageJson === null) {
        throw new Error('Could not find auth token in local storage')
    }
    const fusionStorage = JSON.parse(fusionStorageJson)
    const token = fusionStorage[`${CACHE_ENTRY}:8829d4ca-93e8-499a-8ce1-bc0ef4840176:TOKEN`]
    return token
}

const tokens = new Map<User, string>()

Cypress.Commands.add('login', (user: User) => {
    cy.log('Logging with user: ' + user.username)
    if (tokens.has(user)) {
        window.localStorage.setItem(CACHE_ENTRY, tokens.get(user)!)
        return
    }

    /* Retrieve server endpoints */
    cy.request({
        method: 'GET',
        url: `${SERVER_URL}/${ISSUER}/.well-known/openid-configuration`,
    }).then(resp => {
        var authorizationURL = resp.body.authorization_endpoint
        var tokenURL = resp.body.token_endpoint

        /* Receive Authorization code */
        cy.request({
            method: 'GET',
            followRedirect: false,
            // file deepcode ignore Ssrf: <only used for mock auth>
            url: authorizationURL,
            qs: {
                client_id: user.username,
                scope: 'openid',
                response_type: 'code',
                redirect_uri: `${authorizationURL}/callback`,
            },
        }).then(resp => {
            /* Change to Assertion Function if used more */
            if (typeof resp.headers.location !== 'string') {
                throw new TypeError(`Expected location to be a string,
                                     but was ${resp.headers.location}`)
            }
            const redirectURL = new URL(resp.headers.location)
            const code = new URLSearchParams(redirectURL.search).get('code')

            /* Receive user Tokens with claims that match provided 'mock_claims_for' param */
            cy.request({
                method: 'POST',
                url: tokenURL,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: {
                    grant_type: 'authorization_code',
                    code: code,
                    client_id: user.username,
                    mock_claims_for: user.username,
                },
            }).then(resp => {
                const idToken = resp.body.id_token
                const accessToken = resp.body.access_token

                /* Interesting claims present in the mocked token */
                type customJwtPayload = JwtPayload & {
                    oid: string
                    familyName: string
                    name: string
                    givenName: string
                    roles: string[]
                    upn: string
                }
                const decodedToken = jwtDecode<customJwtPayload>(accessToken)

                /* There is a mismatch between real token claims (aka the ones we get from Microsoft)
                 * and fusion cache (aka there is no familyName in the token). Unclear why.
                 */
                let userData = {
                    id: decodedToken.oid,
                    familyName: decodedToken.familyName,
                    fullName: decodedToken.name,
                    givenName: decodedToken.givenName,
                    roles: decodedToken.roles,
                    upn: decodedToken.upn,
                }

                /*
                 * Set data in cache just as fusion expects to find them.
                 * 8829d4ca... is BMT Azure ID (might be configurable)
                 * 5a842df8... is fusion-cli Azure ID
                 */
                let fusion = {
                    USER: userData,
                    'FUSION_AUTH_CACHE:5a842df8-3238-415d-b168-9f16a6a6031b:TOKEN': idToken,
                    'FUSION_AUTH_CACHE:8829d4ca-93e8-499a-8ce1-bc0ef4840176:TOKEN': accessToken,
                }
                tokens.set(user, JSON.stringify(fusion))
                window.localStorage.setItem(CACHE_ENTRY, tokens.get(user)!)
            })
        })
    })
})

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Retrieve user token from mock-oauth2-server and store it
             * @example cy.login(extHire1)
             */
            login(value: User): Cypress.Chainable
        }
    }
}
