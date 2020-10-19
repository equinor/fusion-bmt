export interface Action {
  actionId: String
  assignedTo: Participant
  createDate: Date
  createdBy: Participant
  description: String
  dueDate: Date
  evaluation: Evaluation
  evaluationId: String
  notes: [Note]
  onHold: Boolean
  priority: Priority
  title: String
}

export interface Answer {
  answeredBy: Participant
  answerId: String
  createDate: Date
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

export enum Discipline {
  COMMISSIONING,
  CONSTRUCTION,
  ENGINEERING,
  PREOPS
}

export interface Evaluation {
  actions: [Action]
  createDate: Date
  evaluationId: String
  participants: [Participant]
  progression: Progression
  project: Project
  projectId: String
  questions: [Question]
}

export interface Mutation {
  createProject(createDate: Date, fusionProjectID: String): Project
}

export interface Note {
  action: Action
  actionId: String
  createDate: Date
  createdBy: Participant
  noteId: String
  text: String
}

export interface Participant {
  createDate: Date
  discipline: Discipline
  evaluation: Evaluation
  evaluationId: String
  fusionPersonId: String
  participantId: String
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

export interface Project {
  createDate: Date
  evaluations: [Evaluation]
  fusionProjectId: String
  projectId: String
}

export interface Query {
  projects: [Project]
}

export interface Question {
  answers: [Answer]
  barrier: Barrier
  createDate: Date
  discipline: Discipline
  evaluation: Evaluation
  evaluationId: String
  questionId: String
  status: Status
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
