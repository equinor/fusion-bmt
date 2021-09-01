import { Organization, Priority, Progression, Role, Severity } from '../../src/api/models'
import { User } from './mock/external/users'

export interface IParticipant {
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

export interface IAnswer {
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

export type IAction = {
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
    typeName?: string
}

export class Note {
    text: string
    action: Action
    createdBy: Participant
    __typename?: string

    constructor({ text, action, createdBy, typeName }: INote) {
        this.text = text
        this.action = action
        this.createdBy = createdBy
        this.__typename = typeName
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
