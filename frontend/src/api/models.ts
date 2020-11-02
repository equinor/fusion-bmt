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
  id: string
  name: string
  participants: [Participant]
  progression: Progression
  project: Project
  projectId: string
  questions: [Question]
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
  COMMISSIONING,
  CONSTRUCTION,
  ENGINEERING,
  PREOPS,
  ALL
}

export namespace Organization {
    export function toString(enumValue: Organization): string {
        return Organization[enumValue];
    }
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
  NOMINATION,
  PREPARATION,
  ALIGNMENT,
  WORKSHOP,
  FOLLOWUP
}

export type Project = {
  createDate: Date
  evaluations: [Evaluation]
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
  status: Status
  supportNotes: string
  text: string
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
