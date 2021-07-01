import users, { User } from './users'

function findUserByID(id: string) {
    return users.filter(u => u.id == id)[0]
}

function findUserByUsername(username: string) {
    return users.filter(u => u.username == username)[0]
}

function getUserData(user: User) {
    // Fields are taken from various real requests
    return {
        positions: [],
        azureUniqueId: user.id,
        mail: user.email,
        name: user.name,
        jobTitle: user.jobTitle,
        department: 'Awesome department',
        fullDepartment: 'Completely awesome department',
        mobilePhone: '+12 34567890',
        officeLocation: 'Flower Garden',
        upn: user.username,
        preferredContactMail: null,
        isResourceOwner: false,
        accountType: user.type,
        company: null,
        roles: [],
        contracts: [],
        accountClassification: 'Internal',
        manager: null,
        managerAzureUniqueId: '000',
    }
}

Cypress.Commands.add('interceptExternal', () => {
    // TODO: maybe more projects needed (interesting isDeleted property)
    cy.intercept('https://pro-s-context-ci.azurewebsites.net/contexts/123', {
        fixture: 'project.json',
    })

    // TODO: do we want to intercept all the outgoing requests that currently result in errors
    cy.intercept('https://pro-s-portal-ci.azurewebsites.net/api/persons/me/settings/apps/bmt', {})

    const personsURL = /https:\/\/pro-s-people-ci\.azurewebsites\.net\/persons\/(.+?)(?:(\?\$.*)|$)/
    cy.intercept(personsURL, req => {
        const id = req.url.match(personsURL)![1]
        const user = findUserByID(id)
        req.reply({
            body: getUserData(user),
        })
    })

    const personsPresenceURL = /https:\/\/pro-s-people-ci\.azurewebsites\.net\/persons\/(.+?)\/presence/
    cy.intercept(personsPresenceURL, req => {
        const id = req.url.match(personsPresenceURL)![1]
        req.reply({
            body: { id: id, availability: 'Available', activity: 'Available' },
        })
    })

    const searchPersonsURL = /https:\/\/pro-s-people-ci\.azurewebsites\.net\/persons\?\$search=(.+)/
    cy.intercept(searchPersonsURL, req => {
        const username = req.url.match(searchPersonsURL)![1]
        const user = findUserByUsername(username)
        req.reply({
            body: [getUserData(user)],
        })
    })
})

before(() => {
    cy.interceptExternal()
    cy.viewport(1800, 1000) //until we decide to test on various resolutions
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
