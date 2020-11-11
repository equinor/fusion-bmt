export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  MultiplierPath: any;
};



export type Action = {
  __typename?: 'Action';
  assignedTo?: Maybe<Participant>;
  createDate: Scalars['DateTime'];
  createdBy?: Maybe<Participant>;
  description?: Maybe<Scalars['String']>;
  dueDate: Scalars['DateTime'];
  id?: Maybe<Scalars['String']>;
  notes?: Maybe<Array<Maybe<Note>>>;
  onHold: Scalars['Boolean'];
  priority?: Maybe<Priority>;
  question?: Maybe<Question>;
  questionId: Scalars['String'];
  title?: Maybe<Scalars['String']>;
};

export type ActionInput = {
  assignedTo?: Maybe<ParticipantInput>;
  createDate: Scalars['DateTime'];
  createdBy?: Maybe<ParticipantInput>;
  description?: Maybe<Scalars['String']>;
  dueDate: Scalars['DateTime'];
  id?: Maybe<Scalars['String']>;
  notes?: Maybe<Array<Maybe<NoteInput>>>;
  onHold: Scalars['Boolean'];
  priority?: Maybe<Priority>;
  question?: Maybe<QuestionInput>;
  questionId: Scalars['String'];
  title?: Maybe<Scalars['String']>;
};

export type Answer = {
  __typename?: 'Answer';
  answeredBy?: Maybe<Participant>;
  createDate: Scalars['DateTime'];
  id?: Maybe<Scalars['String']>;
  progression: Progression;
  question?: Maybe<Question>;
  questionId: Scalars['String'];
  severity?: Maybe<Severity>;
  text?: Maybe<Scalars['String']>;
};

export type AnswerInput = {
  answeredBy?: Maybe<ParticipantInput>;
  createDate: Scalars['DateTime'];
  id?: Maybe<Scalars['String']>;
  progression: Progression;
  question?: Maybe<QuestionInput>;
  questionId: Scalars['String'];
  severity?: Maybe<Severity>;
  text?: Maybe<Scalars['String']>;
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


export type Evaluation = {
  __typename?: 'Evaluation';
  createDate: Scalars['DateTime'];
  id?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  participants?: Maybe<Array<Maybe<Participant>>>;
  progression: Progression;
  project?: Maybe<Project>;
  projectId: Scalars['String'];
  questions?: Maybe<Array<Maybe<Question>>>;
};

export type EvaluationInput = {
  createDate: Scalars['DateTime'];
  id?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  participants?: Maybe<Array<Maybe<ParticipantInput>>>;
  progression: Progression;
  project?: Maybe<ProjectInput>;
  projectId: Scalars['String'];
  questions?: Maybe<Array<Maybe<QuestionInput>>>;
};

export type GraphQuery = {
  __typename?: 'GraphQuery';
  project?: Maybe<Project>;
  projects?: Maybe<Array<Maybe<Project>>>;
};


export type GraphQueryProjectArgs = {
  fusionProjectID?: Maybe<Scalars['String']>;
};


export type Mutation = {
  __typename?: 'Mutation';
  createAnswer?: Maybe<Answer>;
  createEvaluation?: Maybe<Evaluation>;
  createParticipant?: Maybe<Participant>;
};


export type MutationCreateAnswerArgs = {
  answeredBy?: Maybe<ParticipantInput>;
  progression: Progression;
  questionId?: Maybe<Scalars['String']>;
  severity: Severity;
  text?: Maybe<Scalars['String']>;
};


export type MutationCreateEvaluationArgs = {
  azureUniqueId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  projectId?: Maybe<Scalars['String']>;
};


export type MutationCreateParticipantArgs = {
  azureUniqueId?: Maybe<Scalars['String']>;
  evaluationId?: Maybe<Scalars['String']>;
  organization: Organization;
  role: Role;
};

export type Note = {
  __typename?: 'Note';
  action?: Maybe<Action>;
  actionId: Scalars['String'];
  createDate: Scalars['DateTime'];
  createdBy?: Maybe<Participant>;
  id?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
};

export type NoteInput = {
  action?: Maybe<ActionInput>;
  actionId: Scalars['String'];
  createDate: Scalars['DateTime'];
  createdBy?: Maybe<ParticipantInput>;
  id?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
};

export enum Organization {
  Commissioning = 'COMMISSIONING',
  Construction = 'CONSTRUCTION',
  Engineering = 'ENGINEERING',
  Preops = 'PREOPS',
  All = 'ALL'
}

export type Participant = {
  __typename?: 'Participant';
  azureUniqueId: Scalars['String'];
  createDate: Scalars['DateTime'];
  evaluation?: Maybe<Evaluation>;
  evaluationId: Scalars['String'];
  id?: Maybe<Scalars['String']>;
  organization: Organization;
  role: Role;
};

export type ParticipantInput = {
  azureUniqueId: Scalars['String'];
  createDate: Scalars['DateTime'];
  evaluation?: Maybe<EvaluationInput>;
  evaluationId: Scalars['String'];
  id?: Maybe<Scalars['String']>;
  organization: Organization;
  role: Role;
};

export enum Priority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH'
}

export enum Progression {
  Nomination = 'NOMINATION',
  Preparation = 'PREPARATION',
  Alignment = 'ALIGNMENT',
  Workshop = 'WORKSHOP',
  Followup = 'FOLLOWUP'
}

export type Project = {
  __typename?: 'Project';
  createDate: Scalars['DateTime'];
  evaluations?: Maybe<Array<Maybe<Evaluation>>>;
  fusionProjectId: Scalars['String'];
  id?: Maybe<Scalars['String']>;
};

export type ProjectInput = {
  createDate: Scalars['DateTime'];
  evaluations?: Maybe<Array<Maybe<EvaluationInput>>>;
  fusionProjectId: Scalars['String'];
  id?: Maybe<Scalars['String']>;
};

export type Question = {
  __typename?: 'Question';
  actions?: Maybe<Array<Maybe<Action>>>;
  answers?: Maybe<Array<Maybe<Answer>>>;
  barrier: Barrier;
  createDate: Scalars['DateTime'];
  evaluation?: Maybe<Evaluation>;
  evaluationId: Scalars['String'];
  id?: Maybe<Scalars['String']>;
  organization: Organization;
  questionTemplate?: Maybe<QuestionTemplate>;
  questionTemplateId: Scalars['String'];
  supportNotes?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
};

export type QuestionInput = {
  actions?: Maybe<Array<Maybe<ActionInput>>>;
  answers?: Maybe<Array<Maybe<AnswerInput>>>;
  barrier: Barrier;
  createDate: Scalars['DateTime'];
  evaluation?: Maybe<EvaluationInput>;
  evaluationId: Scalars['String'];
  id?: Maybe<Scalars['String']>;
  organization: Organization;
  questionTemplate?: Maybe<QuestionTemplateInput>;
  questionTemplateId: Scalars['String'];
  supportNotes?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
};

export type QuestionTemplate = {
  __typename?: 'QuestionTemplate';
  barrier: Barrier;
  createDate: Scalars['DateTime'];
  id?: Maybe<Scalars['String']>;
  organization: Organization;
  questions?: Maybe<Array<Maybe<Question>>>;
  status: Status;
  supportNotes?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
};

export type QuestionTemplateInput = {
  barrier: Barrier;
  createDate: Scalars['DateTime'];
  id?: Maybe<Scalars['String']>;
  organization: Organization;
  questions?: Maybe<Array<Maybe<QuestionInput>>>;
  status: Status;
  supportNotes?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
};

export enum Role {
  Participant = 'PARTICIPANT',
  Facilitator = 'FACILITATOR',
  Readonly = 'READONLY'
}

export enum Severity {
  Low = 'LOW',
  Limited = 'LIMITED',
  High = 'HIGH',
  Na = 'NA'
}

export enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}
