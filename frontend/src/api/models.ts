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
  evaluations?: Maybe<Array<Maybe<Evaluation>>>;
  participants?: Maybe<Array<Maybe<Participant>>>;
  questions?: Maybe<Array<Maybe<Question>>>;
  answers?: Maybe<Array<Maybe<Answer>>>;
};


export type GraphQueryProjectsArgs = {
  where?: Maybe<ProjectFilterInput>;
};


export type GraphQueryProjectArgs = {
  fusionProjectID?: Maybe<Scalars['String']>;
};


export type GraphQueryEvaluationsArgs = {
  where?: Maybe<EvaluationFilterInput>;
};


export type GraphQueryParticipantsArgs = {
  where?: Maybe<ParticipantFilterInput>;
};


export type GraphQueryQuestionsArgs = {
  where?: Maybe<QuestionFilterInput>;
};


export type GraphQueryAnswersArgs = {
  where?: Maybe<AnswerFilterInput>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createEvaluation?: Maybe<Evaluation>;
  progressEvaluation?: Maybe<Evaluation>;
  progressParticipant?: Maybe<Participant>;
  createParticipant?: Maybe<Participant>;
  deleteParticipant?: Maybe<Participant>;
  setAnswer?: Maybe<Answer>;
};


export type MutationCreateEvaluationArgs = {
  name?: Maybe<Scalars['String']>;
  projectId?: Maybe<Scalars['String']>;
};


export type MutationProgressEvaluationArgs = {
  evaluationId?: Maybe<Scalars['String']>;
  newProgression: Progression;
};


export type MutationProgressParticipantArgs = {
  evaluationId?: Maybe<Scalars['String']>;
  newProgression: Progression;
};


export type MutationCreateParticipantArgs = {
  azureUniqueId?: Maybe<Scalars['String']>;
  evaluationId?: Maybe<Scalars['String']>;
  organization: Organization;
  role: Role;
};


export type MutationDeleteParticipantArgs = {
  participantId?: Maybe<Scalars['String']>;
};


export type MutationSetAnswerArgs = {
  questionId?: Maybe<Scalars['String']>;
  severity: Severity;
  text?: Maybe<Scalars['String']>;
  progression: Progression;
};

export type ProjectFilterInput = {
  and?: Maybe<Array<ProjectFilterInput>>;
  or?: Maybe<Array<ProjectFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  fusionProjectId?: Maybe<StringOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOperationFilterInput>;
  evaluations?: Maybe<ListFilterInputTypeOfEvaluationFilterInput>;
};

export type EvaluationFilterInput = {
  and?: Maybe<Array<EvaluationFilterInput>>;
  or?: Maybe<Array<EvaluationFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  name?: Maybe<StringOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOperationFilterInput>;
  progression?: Maybe<ProgressionOperationFilterInput>;
  participants?: Maybe<ListFilterInputTypeOfParticipantFilterInput>;
  questions?: Maybe<ListFilterInputTypeOfQuestionFilterInput>;
  project?: Maybe<ProjectFilterInput>;
};

export type ParticipantFilterInput = {
  and?: Maybe<Array<ParticipantFilterInput>>;
  or?: Maybe<Array<ParticipantFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  azureUniqueId?: Maybe<StringOperationFilterInput>;
  organization?: Maybe<OrganizationOperationFilterInput>;
  role?: Maybe<RoleOperationFilterInput>;
  progression?: Maybe<ProgressionOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOperationFilterInput>;
  evaluationId?: Maybe<StringOperationFilterInput>;
  evaluation?: Maybe<EvaluationFilterInput>;
};

export type QuestionFilterInput = {
  and?: Maybe<Array<QuestionFilterInput>>;
  or?: Maybe<Array<QuestionFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  organization?: Maybe<OrganizationOperationFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  supportNotes?: Maybe<StringOperationFilterInput>;
  barrier?: Maybe<BarrierOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOperationFilterInput>;
  answers?: Maybe<ListFilterInputTypeOfAnswerFilterInput>;
  actions?: Maybe<ListFilterInputTypeOfActionFilterInput>;
  evaluation?: Maybe<EvaluationFilterInput>;
  questionTemplate?: Maybe<QuestionTemplateFilterInput>;
};

export type AnswerFilterInput = {
  and?: Maybe<Array<AnswerFilterInput>>;
  or?: Maybe<Array<AnswerFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  progression?: Maybe<ProgressionOperationFilterInput>;
  severity?: Maybe<SeverityOperationFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOperationFilterInput>;
  answeredById?: Maybe<StringOperationFilterInput>;
  answeredBy?: Maybe<ParticipantFilterInput>;
  questionId?: Maybe<StringOperationFilterInput>;
  question?: Maybe<QuestionFilterInput>;
};

export type StringOperationFilterInput = {
  and?: Maybe<Array<StringOperationFilterInput>>;
  or?: Maybe<Array<StringOperationFilterInput>>;
  eq?: Maybe<Scalars['String']>;
  neq?: Maybe<Scalars['String']>;
  contains?: Maybe<Scalars['String']>;
  ncontains?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Maybe<Scalars['String']>>>;
  nin?: Maybe<Array<Maybe<Scalars['String']>>>;
  startsWith?: Maybe<Scalars['String']>;
  nstartsWith?: Maybe<Scalars['String']>;
  endsWith?: Maybe<Scalars['String']>;
  nendsWith?: Maybe<Scalars['String']>;
};

export type ComparableDateTimeOperationFilterInput = {
  eq?: Maybe<Scalars['DateTime']>;
  neq?: Maybe<Scalars['DateTime']>;
  in?: Maybe<Array<Scalars['DateTime']>>;
  nin?: Maybe<Array<Scalars['DateTime']>>;
  gt?: Maybe<Scalars['DateTime']>;
  ngt?: Maybe<Scalars['DateTime']>;
  gte?: Maybe<Scalars['DateTime']>;
  ngte?: Maybe<Scalars['DateTime']>;
  lt?: Maybe<Scalars['DateTime']>;
  nlt?: Maybe<Scalars['DateTime']>;
  lte?: Maybe<Scalars['DateTime']>;
  nlte?: Maybe<Scalars['DateTime']>;
};

export type ListFilterInputTypeOfEvaluationFilterInput = {
  all?: Maybe<EvaluationFilterInput>;
  none?: Maybe<EvaluationFilterInput>;
  some?: Maybe<EvaluationFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ProgressionOperationFilterInput = {
  eq?: Maybe<Progression>;
  neq?: Maybe<Progression>;
  in?: Maybe<Array<Progression>>;
  nin?: Maybe<Array<Progression>>;
};

export type ListFilterInputTypeOfParticipantFilterInput = {
  all?: Maybe<ParticipantFilterInput>;
  none?: Maybe<ParticipantFilterInput>;
  some?: Maybe<ParticipantFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputTypeOfQuestionFilterInput = {
  all?: Maybe<QuestionFilterInput>;
  none?: Maybe<QuestionFilterInput>;
  some?: Maybe<QuestionFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type OrganizationOperationFilterInput = {
  eq?: Maybe<Organization>;
  neq?: Maybe<Organization>;
  in?: Maybe<Array<Organization>>;
  nin?: Maybe<Array<Organization>>;
};

export type RoleOperationFilterInput = {
  eq?: Maybe<Role>;
  neq?: Maybe<Role>;
  in?: Maybe<Array<Role>>;
  nin?: Maybe<Array<Role>>;
};

export type BarrierOperationFilterInput = {
  eq?: Maybe<Barrier>;
  neq?: Maybe<Barrier>;
  in?: Maybe<Array<Barrier>>;
  nin?: Maybe<Array<Barrier>>;
};

export type ListFilterInputTypeOfAnswerFilterInput = {
  all?: Maybe<AnswerFilterInput>;
  none?: Maybe<AnswerFilterInput>;
  some?: Maybe<AnswerFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputTypeOfActionFilterInput = {
  all?: Maybe<ActionFilterInput>;
  none?: Maybe<ActionFilterInput>;
  some?: Maybe<ActionFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type QuestionTemplateFilterInput = {
  and?: Maybe<Array<QuestionTemplateFilterInput>>;
  or?: Maybe<Array<QuestionTemplateFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  status?: Maybe<StatusOperationFilterInput>;
  organization?: Maybe<OrganizationOperationFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  supportNotes?: Maybe<StringOperationFilterInput>;
  barrier?: Maybe<BarrierOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOperationFilterInput>;
  questions?: Maybe<ListFilterInputTypeOfQuestionFilterInput>;
};

export type SeverityOperationFilterInput = {
  eq?: Maybe<Severity>;
  neq?: Maybe<Severity>;
  in?: Maybe<Array<Severity>>;
  nin?: Maybe<Array<Severity>>;
};

export type ActionFilterInput = {
  and?: Maybe<Array<ActionFilterInput>>;
  or?: Maybe<Array<ActionFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  assignedTo?: Maybe<ParticipantFilterInput>;
  title?: Maybe<StringOperationFilterInput>;
  description?: Maybe<StringOperationFilterInput>;
  priority?: Maybe<PriorityOperationFilterInput>;
  onHold?: Maybe<BooleanOperationFilterInput>;
  dueDate?: Maybe<ComparableDateTimeOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOperationFilterInput>;
  createdBy?: Maybe<ParticipantFilterInput>;
  notes?: Maybe<ListFilterInputTypeOfNoteFilterInput>;
  question?: Maybe<QuestionFilterInput>;
};

export type StatusOperationFilterInput = {
  eq?: Maybe<Status>;
  neq?: Maybe<Status>;
  in?: Maybe<Array<Status>>;
  nin?: Maybe<Array<Status>>;
};

export type PriorityOperationFilterInput = {
  eq?: Maybe<Priority>;
  neq?: Maybe<Priority>;
  in?: Maybe<Array<Priority>>;
  nin?: Maybe<Array<Priority>>;
};

export type BooleanOperationFilterInput = {
  eq?: Maybe<Scalars['Boolean']>;
  neq?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputTypeOfNoteFilterInput = {
  all?: Maybe<NoteFilterInput>;
  none?: Maybe<NoteFilterInput>;
  some?: Maybe<NoteFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type NoteFilterInput = {
  and?: Maybe<Array<NoteFilterInput>>;
  or?: Maybe<Array<NoteFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  createdBy?: Maybe<ParticipantFilterInput>;
  createDate?: Maybe<ComparableDateTimeOperationFilterInput>;
  action?: Maybe<ActionFilterInput>;
};

export type Evaluation = {
  __typename?: 'Evaluation';
  id: Scalars['String'];
  name: Scalars['String'];
  createDate: Scalars['DateTime'];
  progression: Progression;
  participants: Array<Maybe<Participant>>;
  questions: Array<Maybe<Question>>;
  project: Project;
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['String'];
  fusionProjectId: Scalars['String'];
  createDate: Scalars['DateTime'];
  evaluations: Array<Maybe<Evaluation>>;
};

export type Participant = {
  __typename?: 'Participant';
  id: Scalars['String'];
  azureUniqueId: Scalars['String'];
  organization: Organization;
  role: Role;
  progression: Progression;
  createDate: Scalars['DateTime'];
  evaluationId: Scalars['String'];
  evaluation: Evaluation;
};

export type Question = {
  __typename?: 'Question';
  id: Scalars['String'];
  organization: Organization;
  text: Scalars['String'];
  supportNotes: Scalars['String'];
  barrier: Barrier;
  createDate: Scalars['DateTime'];
  answers: Array<Maybe<Answer>>;
  actions: Array<Maybe<Action>>;
  evaluation: Evaluation;
  questionTemplate: QuestionTemplate;
};

export type Answer = {
  __typename?: 'Answer';
  id: Scalars['String'];
  progression: Progression;
  severity: Severity;
  text: Scalars['String'];
  createDate: Scalars['DateTime'];
  answeredById?: Maybe<Scalars['String']>;
  answeredBy?: Maybe<Participant>;
  questionId: Scalars['String'];
  question: Question;
};

export enum Progression {
  Nomination = 'NOMINATION',
  Preparation = 'PREPARATION',
  Alignment = 'ALIGNMENT',
  Workshop = 'WORKSHOP',
  FollowUp = 'FOLLOW_UP'
}

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
  OrganizationLead = 'ORGANIZATION_LEAD',
  ReadOnly = 'READ_ONLY'
}

export enum Severity {
  Low = 'LOW',
  Limited = 'LIMITED',
  High = 'HIGH',
  Na = 'NA'
}


export enum Barrier {
  Gm = 'GM',
  Ps1 = 'PS1',
  Ps2 = 'PS2',
  Ps3 = 'PS3',
  Ps4 = 'PS4',
  Ps6 = 'PS6',
  Ps7 = 'PS7',
  Ps12 = 'PS12',
  Ps15 = 'PS15',
  Ps22 = 'PS22'
}

export enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export enum Priority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH'
}

export type QuestionTemplate = {
  __typename?: 'QuestionTemplate';
  id: Scalars['String'];
  status: Status;
  organization: Organization;
  text: Scalars['String'];
  supportNotes: Scalars['String'];
  barrier: Barrier;
  createDate: Scalars['DateTime'];
  questions: Array<Maybe<Question>>;
};

export type Action = {
  __typename?: 'Action';
  id: Scalars['String'];
  assignedTo?: Maybe<Participant>;
  title: Scalars['String'];
  description: Scalars['String'];
  priority: Priority;
  onHold: Scalars['Boolean'];
  dueDate: Scalars['DateTime'];
  createDate: Scalars['DateTime'];
  createdBy?: Maybe<Participant>;
  notes: Array<Maybe<Note>>;
  question: Question;
};

export type Note = {
  __typename?: 'Note';
  id: Scalars['String'];
  text: Scalars['String'];
  createdBy?: Maybe<Participant>;
  createDate: Scalars['DateTime'];
  action: Action;
};
