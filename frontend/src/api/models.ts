export type Action = {
    assignedTo: Participant
    createDate: Date
    createdBy: Participant
    description: string
    dueDate: Date
    id: string
    notes: [Note]
    onHold: Boolean
    priority: Priority
    question: Question
    questionId: string
    title: string
}

export type Answer = {
    answeredBy: Participant
    createDate: Date
    id: string
    progression: Progression
    question: Question
    questionId: string
    severity: Severity
    text: string
}

export enum Barrier {
    GM = "General Matters",
    PS1 = "Containment",
    PS2 = "HVAC",
    PS3 = "Leak Detection",
    PS4 = "ESD",
    PS6 = "Ignition Source Control",
    PS7 = "Fire Detection",
    PS12 = "Process Safety",
    PS15 = "Layout",
    PS22 = "HMI"
}

export type Evaluation = {
  createDate: Date
  id: string
  name: string
  participants: Participant[]
  progression: Progression
  project: Project
  projectId: string
  questions: Question[]
}

export type Mutation = {
    createProject(fusionProjectID: string): Project
}

export type Note = {
    action: Action
    actionId: string
    createDate: Date
    createdBy: Participant
    id: string
    text: string
}

export enum Organization {
    COMMISSIONING = "Commissioning",
    CONSTRUCTION = "Construction",
    ENGINEERING = "Engineering",
    PREOPS = "PreOps",
    ALL = "All"
}

export type Participant = {
    createDate: Date
    evaluation: Evaluation
    evaluationId: string
    fusionPersonId: string
    id: string
    organization: Organization
    role: Role
}

export enum Priority {
    LOW,
    MEDIUM,
    HIGH
}

export enum Progression {
    NOMINATION = "Nomination",
    PREPARATION = "Preparation",
    ALIGNMENT = "Alignment",
    WORKSHOP = "Workshop",
    FOLLOWUP = "Follow-up"
}

export type Project = {
  createDate: Date
  evaluations: Evaluation[]
  fusionProjectId: string
  id: string
}

export type Query = {
    projects: [Project]
}

export type Question = {
    actions: Action[]
    answers: Answer[]
    barrier: Barrier
    createDate: Date
    evaluation: Evaluation
    evaluationId: string
    id: string
    organization: Organization
    questionTemplate: QuestionTemplate
    questionTemplateId: string
    supportNotes: string
    text: string
}

export type QuestionTemplate = {
    barrier: Barrier
    createDate: Date
    id: string
    organization: Organization
    questions: Question[]
    status: Status
    supportNotes: string
    text: string
}

export enum Role {
    PARTICIPANT = "Participant",
    FACILITATOR = "Facilitator",
    READONLY = "ReadOnly"
}

export enum Severity {
    LOW,
    LIMITED,
    HIGH,
    NA
}

export enum Status {
    ACTIVE,
    INACTIVE
}
