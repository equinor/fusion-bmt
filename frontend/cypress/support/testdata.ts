import * as faker from 'faker'
import { Action, Participant, IParticipant, IAction } from './mocks'
import { Progression, Role, Organization, Priority } from '../../src/api/models'
import { EvaluationSeed } from './evaluation_seed'

export function createParticipant({ user, role, progression, organization }: IParticipant): Participant {
    if (progression === undefined) {
        progression = faker.random.arrayElement(Object.values(Progression))
    }
    if (role === undefined) {
        role = faker.random.arrayElement(Object.values(Role))
    }
    if (organization === undefined) {
        organization = faker.random.arrayElement(Object.values(Organization))
    }
    return new Participant({ user: user, role: role, organization: organization, progression: progression })
}

export function createAction(
    this: EvaluationSeed,
    {
        assignedTo = faker.random.arrayElement(this!.participants),
        createdBy = faker.random.arrayElement(this!.participants),
        // no access to questions as creation is run before plant. Reconsider?
        questionOrder = faker.datatype.number({ min: 1, max: 3 }),
        dueDate = faker.date.future(),
        title = faker.lorem.sentence(),
        priority = faker.random.arrayElement(Object.values(Priority)),
        description = faker.lorem.words(),
        completed = faker.datatype.boolean(),
        onHold = faker.datatype.boolean(),
    }: Partial<IAction>
) {
    return new Action({ assignedTo, createdBy, questionOrder, dueDate, title, priority, description, completed, onHold })
}

export function findRandomParticipant(this: EvaluationSeed, role: Role): Participant {
    let participants: Participant[] = this.participants.filter(x => {
        return x.role === role
    })
    const participant = faker.random.arrayElement(participants)
    return participant
}
