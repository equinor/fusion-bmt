import { Organization, Priority, Progression, Role, Severity } from '../../src/api/models'
import { User } from './users'
import * as faker from 'faker'
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
    questionOrder?: number
    assignedTo?: Participant
    createdBy?: Participant
    createDate?: Date
    dueDate?: Date
    title?: string
    priority?: Priority
    description?: string
    completed?: boolean
    onHold?: boolean
    seed?: EvaluationSeed
}

export function createAction(this: EvaluationSeed, action: IAction) {
    return new Action({ ...action, seed: this })
}

export class Action {
    id: string = ''
    questionOrder: number
    assignedTo: Participant
    createdBy: Participant
    createDate: Date
    dueDate: Date
    title: string
    priority: Priority
    description: string
    completed?: boolean
    onHold?: boolean

    constructor({
        seed,
        assignedTo = faker.random.arrayElement(seed!.participants),
        createdBy = faker.random.arrayElement(seed!.participants),
        // no access to questions as creation is run before plant. Reconsider?
        questionOrder = faker.datatype.number({ min: 1, max: 3 }),
        createDate = faker.date.past(),
        dueDate = faker.date.future(),
        title = faker.lorem.sentence(),
        priority = faker.random.arrayElement(Object.values(Priority)),
        description = faker.lorem.words(),
        completed = faker.datatype.boolean(),
        onHold = faker.datatype.boolean(),
    }: IAction) {
        this.questionOrder = questionOrder
        this.assignedTo = assignedTo
        this.createdBy = createdBy
        this.createDate = createDate
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
