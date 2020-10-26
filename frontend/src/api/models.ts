export type Action = {
  assignedTo: Participant
  createDate: Date
  createdBy: Participant
  description: String
  dueDate: Date
  id: String
  notes: [Note]
  onHold: Boolean
  priority: Priority
  question: Question
  questionId: String
  title: String
}

export type Answer = {
  answeredBy: Participant
  createDate: Date
  id: String
  progression: Progression
  question: Question
  questionId: String
  severity: Severity
  text: String
}

export enum Barrier {
  GM,
  PS1,
  PS2,
  PS3,
  PS4,
  PS5,
  PS6,
  PS7,
  PS12,
  PS15,
  PS22
}

export type Evaluation = {
  createDate: Date
  id: String
  name: String
  participants: [Participant]
  progression: Progression
  project: Project
  projectId: String
  questions: [Question]
}

export type Mutation = {
  createProject(fusionProjectID: String): Project
}

export type Note = {
  action: Action
  actionId: String
  createDate: Date
  createdBy: Participant
  id: String
  text: String
}

export enum Organization {
  COMMISSIONING,
  CONSTRUCTION,
  ENGINEERING,
  PREOPS,
  ALL
}

export type Participant = {
  createDate: Date
  evaluation: Evaluation
  evaluationId: String
  fusionPersonId: String
  id: String
  organization: Organization
  role: Role
}

export enum Priority {
  LOW,
  MEDIUM,
  HIGH
}

export enum Progression {
  NOMINATION,
  PREPARATION,
  ALIGNMENT,
  WORKSHOP,
  FOLLOWUP
}

export type Project = {
  createDate: Date
  evaluations: [Evaluation]
  fusionProjectId: String
  id: String
}

export type Query = {
  projects: [Project]
}

export type Question = {
  actions: [Action]
  answers: [Answer]
  barrier: Barrier
  createDate: Date
  evaluation: Evaluation
  evaluationId: String
  id: String
  organization: Organization
  status: Status
  supportNotes: String
  text: String
}

export enum Role {
  PARTICIPANT,
  FACILITATOR,
  READONLY
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
