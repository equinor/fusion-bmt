import * as faker from 'faker'

import { Organization, Priority, Progression, Role, Severity } from '../../src/api/models'
import { User } from './mock/external/users'
import { EvaluationSeed } from './evaluation_seed'

interface IParticipant {
    user: User
    role?: Role
    organization?: Organization
    progression?: Progression
}

export class Participant {
    id: string = ''
    user: User
    role: Role
    organization: Organization
    progression: Progression

    constructor({ user, role = Role.Participant, organization = Organization.All, progression = Progression.Individual }: IParticipant) {
        this.user = user
        this.role = role
        this.organization = organization
        this.progression = progression
    }
}

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

interface IAnswer {
    questionOrder: number
    answeredBy: Participant
    progression?: Progression
    text?: string
    severity?: Severity
}

export class Answer {
    id: string = ''
    questionOrder: number
    answeredBy: Participant
    progression: Progression
    text: string
    severity: Severity

    constructor({ questionOrder, answeredBy, progression = answeredBy.progression, text = '', severity = Severity.Na }: IAnswer) {
        this.questionOrder = questionOrder
        this.answeredBy = answeredBy
        this.progression = progression
        this.text = text
        this.severity = severity
    }
}

type IAction = {
    questionOrder: number
    assignedTo: Participant
    createdBy: Participant
    dueDate: Date
    title: string
    priority: Priority
    description?: string
    completed?: boolean
    onHold?: boolean
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

export class Action {
    id: string = ''
    questionOrder: number
    assignedTo: Participant
    createdBy: Participant
    dueDate: Date
    title: string
    priority: Priority
    description: string
    completed?: boolean
    onHold?: boolean

    constructor({
        questionOrder,
        assignedTo,
        createdBy,
        dueDate,
        title,
        priority,
        description = '',
        completed = false,
        onHold = false,
    }: IAction) {
        this.questionOrder = questionOrder
        this.assignedTo = assignedTo
        this.createdBy = createdBy
        this.dueDate = dueDate
        this.title = title
        this.priority = priority
        this.description = description
        this.completed = completed
        this.onHold = onHold
    }
}

interface INote {
    text: string
    action: Action
    createdBy: Participant
}

export class Note {
    text: string
    action: Action
    createdBy: Participant

    constructor({ text, action, createdBy }: INote) {
        this.text = text
        this.action = action
        this.createdBy = createdBy
    }
}

export class Summary {
    summary: string
    createdBy: Participant

    constructor(summary: string, createdBy: Participant) {
        this.summary = summary
        this.createdBy = createdBy
    }
}
