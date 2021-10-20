import { getUserData, findUserByID, findUserByUsername } from './users'
import { fusionProjects, getFusionProjectData, findFusionProjectByID } from './projects'

const settingsURL = /https:\/\/pro-s-portal-ci\.azurewebsites\.net\/api\/persons\/me\/settings\/apps\/bmt/
const featuresURL = /https:\/\/pro-s-portal-ci\.azurewebsites\.net\/log\/features/
const configURL = /https:\/\/pro-s-portal-ci\.azurewebsites\.net\/api\/apps\/bmt\/config/
const projectURL = /https:\/\/pro-s-context-ci\.azurewebsites\.net\/contexts\/(.+)/
const projectsURL = /https:\/\/pro-s-context-ci\.azurewebsites\.net\/contexts$/
const personURL = /https:\/\/pro-s-people-ci\.azurewebsites\.net\/persons\/(.+?)(?:(\?\$.*)|$)/
const personPresenceURL = /https:\/\/pro-s-people-ci\.azurewebsites\.net\/persons\/(.+?)\/presence/
const searchPersonsURL = /https:\/\/pro-s-people-ci\.azurewebsites\.net\/persons\?\$search=(.+)/

const interceptedURLs = [settingsURL, featuresURL, configURL, projectURL, projectsURL, personURL, personPresenceURL, searchPersonsURL]

Cypress.Commands.add('interceptExternal', () => {
    cy.intercept(settingsURL, {})
    cy.intercept(featuresURL, {})

    cy.intercept(configURL, req => {
        req.reply({
            body: { environment: {}, endpoints: {} },
        })
    })

    cy.intercept(projectURL, req => {
        const fusionProjectId = req.url.match(projectURL)![1]
        const project = findFusionProjectByID(fusionProjectId)
        req.reply({
            body: getFusionProjectData(project),
        })
    })

    cy.intercept(projectsURL, req => {
        req.reply({
            body: fusionProjects.map(p => {
                return getFusionProjectData(p)
            }),
        })
    })

    cy.intercept(personURL, req => {
        const id = req.url.match(personURL)![1]
        const user = findUserByID(id)
        req.reply({
            body: getUserData(user),
        })
    })

    cy.intercept(personPresenceURL, req => {
        const id = req.url.match(personPresenceURL)![1]
        req.reply({
            body: { id: id, availability: 'Available', activity: 'Available' },
        })
    })

    cy.intercept(searchPersonsURL, req => {
        const username = req.url.match(searchPersonsURL)![1]
        const user = findUserByUsername(username)
        req.reply({
            body: [getUserData(user)],
        })
    })
})

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Intercept external to bmt calls to protected resources and return
             * dummy values
             * @example cy.interceptExternal()
             */
            interceptExternal(): void
        }
    }
}

Cypress.on('uncaught:exception', (err, runnable, promise) => {
    /**
     * Ignore exceptions thrown by fusion
     * see https://docs.cypress.io/api/events/catalog-of-events#Uncaught-Exceptions
     */
    if (promise) {
        /* As per Cypress, "all intercepts are automatically cleared before
         * every test." If it happens while external async calls are still being
         * made, we get get unhandled promises errors. Hence for stability
         * purpose we will ignore these promises again.
         */
        const messageRegex = '> (.*)'
        const messageMatch = err.message.match(messageRegex)

        if (messageMatch) {
            const message = messageMatch[1]

            /* It looks like majority of our stability issues fall under this message: */
            if (message === 'Failed to fetch' || message === 'NetworkError when attempting to fetch resource.') {
                console.log(`Swallowing unhandled "Failed to fetch" promise:\n\n%c${err.message}\n`, 'padding-left: 30px;')
                return false
            }

            /* But a certain number falls here */
            const failingURLRegex = /\[(http.*?)\]/
            const failingURLMatch = err.message.match(failingURLRegex)
            if (failingURLMatch) {
                const failingURL = err.message.match(failingURLRegex)![1]
                for (const interceptedURL of interceptedURLs) {
                    if (failingURL.match(interceptedURL)) {
                        console.log(
                            `Swallowing unhandled promise:\n\n%c${err.message}%c\n\nas per match for intercepting regex %c${interceptedURL}`,
                            'padding-left: 30px;',
                            '',
                            'font-weight: bold;'
                        )
                        return false
                    }
                }
            }

            /* Sometimes we get an empty promise due to intercepted requests. */
            if (message === '') {
                console.log('Swallowing empty unhandled promise:\n' + err.stack)
                return false
            }

            /* Log remaining unhandled promises as Cypress sometimes doesn't log them fully */
            console.log('Unhandled promise uncaught: ' + err.message)
        }
    }

    /* thrown sometimes when navigating through stepper, looks to be from fusion */
    if (
        err.message.includes("Cannot read property 'removeEventListener' of null") ||
        err.message.includes('can\'t access property "removeEventListener", editorRef.current is null') ||
        err.message.includes("Cannot read properties of null (reading 'removeEventListener')")
    ) {
        return false
    }

    if (err.message.includes("Cannot read properties of null (reading 'removeEventListener')")) {
        return false
    }
})
