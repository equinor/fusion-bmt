export type Maybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `DateTime` scalar represents an ISO-8601 compliant date time type. */
  DateTime: any;
};

export enum ApplyPolicy {
  BeforeResolver = 'BEFORE_RESOLVER',
  AfterResolver = 'AFTER_RESOLVER'
}

export type GraphQuery = {
  __typename?: 'GraphQuery';
  projects?: Maybe<Array<Maybe<Project>>>;
  project?: Maybe<Project>;
};


export type GraphQueryProjectArgs = {
  fusionProjectID?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createEvaluation?: Maybe<Evaluation>;
  createParticipant?: Maybe<Participant>;
  createAnswer?: Maybe<Answer>;
};


export type MutationCreateEvaluationArgs = {
  name?: Maybe<Scalars['String']>;
  projectId?: Maybe<Scalars['String']>;
  azureUniqueId?: Maybe<Scalars['String']>;
};


export type MutationCreateParticipantArgs = {
  azureUniqueId?: Maybe<Scalars['String']>;
  evaluationId?: Maybe<Scalars['String']>;
  organization: Organization;
  role: Role;
};


export type MutationCreateAnswerArgs = {
  answeredBy?: Maybe<ParticipantInput>;
  progression: Progression;
  questionId?: Maybe<Scalars['String']>;
  severity: Severity;
  text?: Maybe<Scalars['String']>;
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['String'];
  fusionProjectId: Scalars['String'];
  createDate: Scalars['DateTime'];
  evaluations: Array<Maybe<Evaluation>>;
};

export type Evaluation = {
  __typename?: 'Evaluation';
  id: Scalars['String'];
  name: Scalars['String'];
  projectId: Scalars['String'];
  createDate: Scalars['DateTime'];
  progression: Progression;
  participants: Array<Maybe<Participant>>;
  questions: Array<Maybe<Question>>;
  project: Project;
};

export type Participant = {
  __typename?: 'Participant';
  id: Scalars['String'];
  evaluationId: Scalars['String'];
  azureUniqueId: Scalars['String'];
  organization: Organization;
  role: Role;
  createDate: Scalars['DateTime'];
  evaluation?: Maybe<Evaluation>;
};

export type Answer = {
  __typename?: 'Answer';
  id: Scalars['String'];
  questionId: Scalars['String'];
  progression: Progression;
  severity: Severity;
  text: Scalars['String'];
  createDate: Scalars['DateTime'];
  answeredBy: Participant;
  question?: Maybe<Question>;
};

export enum Organization {
  Commissioning = 'COMMISSIONING',
  Construction = 'CONSTRUCTION',
  Engineering = 'ENGINEERING',
  PreOps = 'PRE_OPS',
  All = 'ALL'
}

export enum Role {
  Participant = 'PARTICIPANT',
  Facilitator = 'FACILITATOR',
  ReadOnly = 'READ_ONLY'
}

export type ParticipantInput = {
  id: Scalars['String'];
  evaluationId: Scalars['String'];
  azureUniqueId: Scalars['String'];
  organization: Organization;
  role: Role;
  createDate: Scalars['DateTime'];
  evaluation?: Maybe<EvaluationInput>;
};

export enum Progression {
  Nomination = 'NOMINATION',
  Preparation = 'PREPARATION',
  Alignment = 'ALIGNMENT',
  Workshop = 'WORKSHOP',
  FollowUp = 'FOLLOW_UP'
}

export enum Severity {
  Low = 'LOW',
  Limited = 'LIMITED',
  High = 'HIGH',
  Na = 'NA'
}


export type Question = {
  __typename?: 'Question';
  id: Scalars['String'];
  evaluationId: Scalars['String'];
  questionTemplateId: Scalars['String'];
  organization: Organization;
  text?: Maybe<Scalars['String']>;
  supportNotes?: Maybe<Scalars['String']>;
  barrier: Barrier;
  createDate: Scalars['DateTime'];
  answers: Array<Maybe<Answer>>;
  actions?: Maybe<Array<Maybe<Action>>>;
  evaluation: Evaluation;
  questionTemplate: QuestionTemplate;
};

export type EvaluationInput = {
  id: Scalars['String'];
  name: Scalars['String'];
  projectId: Scalars['String'];
  createDate: Scalars['DateTime'];
  progression: Progression;
  participants: Array<Maybe<ParticipantInput>>;
  questions: Array<Maybe<QuestionInput>>;
  project: ProjectInput;
};

export enum Barrier {
  Gm = 'GM',
  Ps1 = 'PS1',
  Ps2 = 'PS2',
  Ps3 = 'PS3',
  Ps4 = 'PS4',
  Ps5 = 'PS5',
  Ps6 = 'PS6',
  Ps7 = 'PS7',
  Ps12 = 'PS12',
  Ps15 = 'PS15',
  Ps22 = 'PS22'
}

export type Action = {
  __typename?: 'Action';
  id: Scalars['String'];
  questionId: Scalars['String'];
  assignedTo?: Maybe<Participant>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  priority?: Maybe<Priority>;
  onHold: Scalars['Boolean'];
  dueDate: Scalars['DateTime'];
  createDate: Scalars['DateTime'];
  createdBy?: Maybe<Participant>;
  notes?: Maybe<Array<Maybe<Note>>>;
  question?: Maybe<Question>;
};

export type QuestionTemplate = {
  __typename?: 'QuestionTemplate';
  id: Scalars['String'];
  status: Status;
  organization: Organization;
  text: Scalars['String'];
  supportNotes?: Maybe<Scalars['String']>;
  barrier: Barrier;
  createDate: Scalars['DateTime'];
  questions: Array<Maybe<Question>>;
};

export type QuestionInput = {
  id: Scalars['String'];
  evaluationId: Scalars['String'];
  questionTemplateId: Scalars['String'];
  organization: Organization;
  text?: Maybe<Scalars['String']>;
  supportNotes?: Maybe<Scalars['String']>;
  barrier: Barrier;
  createDate: Scalars['DateTime'];
  answers: Array<Maybe<AnswerInput>>;
  actions?: Maybe<Array<Maybe<ActionInput>>>;
  evaluation: EvaluationInput;
  questionTemplate: QuestionTemplateInput;
};

export type ProjectInput = {
  id: Scalars['String'];
  fusionProjectId: Scalars['String'];
  createDate: Scalars['DateTime'];
  evaluations: Array<Maybe<EvaluationInput>>;
};

export enum Priority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH'
}

export type Note = {
  __typename?: 'Note';
  id: Scalars['String'];
  actionId: Scalars['String'];
  text?: Maybe<Scalars['String']>;
  createdBy?: Maybe<Participant>;
  createDate: Scalars['DateTime'];
  action?: Maybe<Action>;
};

export enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export type AnswerInput = {
  id: Scalars['String'];
  questionId: Scalars['String'];
  progression: Progression;
  severity: Severity;
  text: Scalars['String'];
  createDate: Scalars['DateTime'];
  answeredBy: ParticipantInput;
  question?: Maybe<QuestionInput>;
};

export type ActionInput = {
  id: Scalars['String'];
  questionId: Scalars['String'];
  assignedTo?: Maybe<ParticipantInput>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  priority?: Maybe<Priority>;
  onHold: Scalars['Boolean'];
  dueDate: Scalars['DateTime'];
  createDate: Scalars['DateTime'];
  createdBy?: Maybe<ParticipantInput>;
  notes?: Maybe<Array<Maybe<NoteInput>>>;
  question?: Maybe<QuestionInput>;
};

export type QuestionTemplateInput = {
  id: Scalars['String'];
  status: Status;
  organization: Organization;
  text: Scalars['String'];
  supportNotes?: Maybe<Scalars['String']>;
  barrier: Barrier;
  createDate: Scalars['DateTime'];
  questions: Array<Maybe<QuestionInput>>;
};

export type NoteInput = {
  id: Scalars['String'];
  actionId: Scalars['String'];
  text?: Maybe<Scalars['String']>;
  createdBy?: Maybe<ParticipantInput>;
  createDate: Scalars['DateTime'];
  action?: Maybe<ActionInput>;
};
