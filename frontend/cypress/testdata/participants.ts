import * as faker from 'faker'
import { Participant } from '../support/mocks'
import { User } from '../support/mock/external/users'
import { EvaluationSeed } from '../support/evaluation_seed'

import { Organization, Progression, Role } from '../../src/api/models'

type ParticipantInput = {
    user: User
    role?: Role
    progression?: Progression
}
export function createParticipant(this: EvaluationSeed, { user, role, progression }: ParticipantInput): Participant {
    if (progression === undefined) {
        progression = faker.random.arrayElement(Object.values(Progression))
    }
    if (role === undefined) {
        role = faker.random.arrayElement(Object.values(Role))
    }
    const organisation = faker.random.arrayElement(Object.values(Organization))
    return new Participant({ user: user, role: role, organization: organisation, progression: progression })
}
