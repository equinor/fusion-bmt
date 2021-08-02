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

    constructor({
        id,
        name,
        username,
        type,
        email = username + '@example.com',
        jobTitle = username,
    }: {
        id: string
        name: string
        username: string
        type: string
        email?: string
        jobTitle?: string
    }) {
        this.id = id
        this.name = name
        this.username = username
        this.type = type
        this.email = email
        this.jobTitle = jobTitle
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
})
const local1 = new User({
    id: '666',
    name: 'Dancing Penguin',
    username: 'penguin',
    type: Type.LOCAL,
    jobTitle: 'Local 🐧',
})

export const users = [employee1, external1, consultant1, extHire1, unknown1, local1]

export function getUsers(n: number) : User[]{
    if (n > users.length) {
        const msg = `You requested more mocked users (${n})
            than currently available (${users.length})`

        throw new RangeError(msg)
    }

    if (n < 0) {
        throw new RangeError("Requested number of users can't be negative")
    }

    return faker.helpers.shuffle([...users]).slice(0, n)
}

