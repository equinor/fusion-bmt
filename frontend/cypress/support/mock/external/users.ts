import { urlGetAbsoluteUrl } from '@microsoft/applicationinsights-common'
import * as faker from 'faker'

const Type = {
    EMPLOYEE: 'Employee',
    CONSULTANT: 'Consultant',
    EXTERNAL: 'External',
    UNKNOWN: 'Unknown',
    LOCAL: 'Local',
}

export class User {
    id: string
    name: string
    username: string
    type: string
    email: string
    jobTitle: string
    roles: string[]

    constructor({
        id,
        name,
        username,
        type,
        email = username + '@example.com',
        jobTitle = username,
        roles = [],
    }: {
        id: string
        name: string
        username: string
        type: string
        email?: string
        jobTitle?: string
        roles?: string[]
    }) {
        this.id = id
        this.name = name
        this.username = username
        this.type = type
        this.email = email
        this.jobTitle = jobTitle
        this.roles = roles
    }
}

/*
 * Contains data used in application, so it can be used in queries or asserted
 * Values must be somewhat in sync with claims returned by oauth2-server
 */

const employee1 = new User({
    id: '111',
    name: 'Fat Cat',
    username: 'cat',
    type: Type.EMPLOYEE,
    jobTitle: 'A cat 🐱',
})
const external1 = new User({
    id: '222',
    name: 'Cool Doggy',
    username: 'doggy',
    type: Type.EXTERNAL,
    jobTitle: 'A doggy 🐶',
})
const consultant1 = new User({
    id: '333',
    name: 'Scared Giraffe',
    username: 'giraffe',
    type: Type.CONSULTANT,
    jobTitle: '🦒',
})
const extHire1 = new User({
    id: '444',
    name: 'Rainbow Unicorn',
    username: 'unicorn',
    type: Type.EMPLOYEE,
    jobTitle: 'Ext Hire 🦄',
})
const unknown1 = new User({
    id: '555',
    name: 'Trashy Raccoon',
    username: 'raccoon',
    type: Type.UNKNOWN,
    jobTitle: 'Secret Agent 🦝',
    roles: ['Role.Facilitator'],
})
const local1 = new User({
    id: '666',
    name: 'Dancing Penguin',
    username: 'penguin',
    type: Type.LOCAL,
    jobTitle: 'Local 🐧',
    roles: ['Role.Admin'],
})

export const users = [employee1, external1, consultant1, extHire1, unknown1, local1]

export function getUserWithAdminRole(): User {
    const adminUser = users.find(u => u.roles.includes('Role.Admin'))
    if (adminUser === undefined) {
        throw new Error('Could not find user with admin role')
    }
    return adminUser
}

export function getUserWithFacilitatorRole(): User {
    const facilitatorUser = users.find(u => u.roles.includes('Role.Facilitator'))
    if (facilitatorUser === undefined) {
        throw new Error('Could not find user with facilitator role')
    }
    return facilitatorUser
}

export function getUserWithNoRoles(): User {
    const noRoleUser = users.find(u => !u.roles.includes('Role.Admin') && !u.roles.includes('Role.Facilitator'))
    if (noRoleUser === undefined) {
        throw new Error('Could not find user with no roles')
    }
    return noRoleUser
}

export function getUserWithNoAdminRole(): User {
    const nonAdminUser = users.find(u => !u.roles.includes('Role.Admin'))
    if (nonAdminUser === undefined) {
        throw new Error('Could not find user with no roles')
    }
    return nonAdminUser
}

export function getUsers(n: number): User[] {
    if (n > users.length) {
        const msg = `You requested more mocked users (${n})
            than currently available (${users.length})`

        throw new RangeError(msg)
    }

    if (n < 0) {
        throw new RangeError("Requested number of users can't be negative")
    }

    return users.slice(0, n)
}

export function findUserByID(id: string) {
    return users.filter(u => u.id == id)[0]
}

export function findUserByUsername(username: string) {
    return users.filter(u => u.username == username)[0]
}

export function getUserData(user: User) {
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
