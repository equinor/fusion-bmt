import { Organization, Priority, Progression, Role, Severity } from '../../src/api/models'
import { User } from './users'


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

    constructor ({
        user,
        role = Role.Participant,
        organization =  Organization.All,
        progression = Progression.Individual
    }: IParticipant) {
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

    constructor({
        questionOrder,
        answeredBy,
        progression = answeredBy.progression,
        text = '',
        severity = Severity.Na,
    }: IAnswer) {
        this.questionOrder = questionOrder
        this.answeredBy = answeredBy
        this.progression = progression
        this.text = text
        this.severity = severity
    }
}


interface IAction {
    questionOrder: number
    assignedTo: Participant
    createdBy: Participant
    dueDate: Date
    title: string
    priority: Priority
    description?: string
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

    constructor({
        questionOrder,
        assignedTo,
        createdBy,
        dueDate,
        title,
        priority,
        description = '',
    }: IAction) {
        this.questionOrder = questionOrder
        this.assignedTo = assignedTo
        this.createdBy = createdBy
        this.dueDate = dueDate
        this.title = title
        this.priority = priority
        this.description = description
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

    constructor({
        text,
        action,
        createdBy,
    }: INote) {
        this.text = text
        this.action = action
        this.createdBy = createdBy
    }
}


export class Summary {
    summary: string
    createdBy: Participant

    constructor (summary: string, createdBy: Participant) {
        this.summary = summary
        this.createdBy = createdBy
    }
}
