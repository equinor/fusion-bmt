import { Organization, Priority, Progression, ProjectCategory, Role, Severity, Status } from '../../src/api/models'
import { User } from './mock/external/users'

export interface IParticipant {
    user: User
    role: Role
    organization?: Organization
    progression: Progression
}

export class Participant {
    id: string = ''
    user: User
    role: Role
    organization: Organization
    progression: Progression

    constructor({ user, role, organization = Organization.All, progression }: IParticipant) {
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

export class Question {
    id: string
    text: string

    constructor(id: string, text: string) {
        this.id = id
        this.text = text
    }
}

export class Evaluation {
    id: string
    name: string
    questions: Array<Question>

    constructor(id: string, name: string, questions: Array<Question>) {
        this.id = id
        this.name = name
        this.questions = questions
    }
}

export class QuestionTemplate {
    id: string
    projectCategories: Array<ProjectCategory>
    status: Status

    constructor(id: string, projectCategories: Array<ProjectCategory>, status: Status) {
        this.id = id
        this.projectCategories = projectCategories
        this.status = status
    }
}
