import * as faker from 'faker'
import { Participant } from '../support/mocks'
import { User } from '../support/mock/external/users'

import { Organization, Progression, Role } from '../../src/api/models'

type ParticipantInput = {
    users: User[]
    role?: Role
    progression?: Progression
}
export function createParticipants({ users, role, progression }: ParticipantInput) {
    let participants: Participant[] = []
    users.forEach(user => {
        if (progression === undefined) {
            progression = faker.random.arrayElement(Object.values(Progression))
        }
        if (role === undefined) {
            role = faker.random.arrayElement(Object.values(Role))
        }
        const organisation = faker.random.arrayElement(Object.values(Organization))
        participants.push(new Participant({ user: user, role: role, organization: organisation, progression: progression }))
    })
    participants[0].role = Role.Facilitator
    return participants
}
