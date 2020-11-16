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

export type Mutation = {
  __typename?: 'Mutation';
  createEvaluation?: Maybe<Evaluation>;
  progressEvaluation?: Maybe<Evaluation>;
  createParticipant?: Maybe<Participant>;
  createAnswer?: Maybe<Answer>;
};


export type MutationCreateEvaluationArgs = {
  name?: Maybe<Scalars['String']>;
  projectId?: Maybe<Scalars['String']>;
  azureUniqueId?: Maybe<Scalars['String']>;
};


export type MutationProgressEvaluationArgs = {
  evaluationId?: Maybe<Scalars['String']>;
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

export type ProjectFilterInput = {
  and?: Maybe<Array<ProjectFilterInput>>;
  or?: Maybe<Array<ProjectFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  fusionProjectId?: Maybe<StringOperationFilterInput>;
  createDate?: Maybe<ComparableOperationFilterInputOfDateTimeFilterInput>;
  evaluations?: Maybe<ListFilterInputOfFilterInputTypeOfEvaluationFilterInput>;
};

export type EvaluationFilterInput = {
  and?: Maybe<Array<EvaluationFilterInput>>;
  or?: Maybe<Array<EvaluationFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  name?: Maybe<StringOperationFilterInput>;
  projectId?: Maybe<StringOperationFilterInput>;
  createDate?: Maybe<ComparableOperationFilterInputOfDateTimeFilterInput>;
  progression?: Maybe<EnumOperationFilterInputOfNullableOfProgressionFilterInput>;
  participants?: Maybe<ListFilterInputOfFilterInputTypeOfParticipantFilterInput>;
  questions?: Maybe<ListFilterInputOfFilterInputTypeOfQuestionFilterInput>;
  project?: Maybe<ProjectFilterInput>;
};

export type ParticipantFilterInput = {
  and?: Maybe<Array<ParticipantFilterInput>>;
  or?: Maybe<Array<ParticipantFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  evaluationId?: Maybe<StringOperationFilterInput>;
  azureUniqueId?: Maybe<StringOperationFilterInput>;
  organization?: Maybe<EnumOperationFilterInputOfNullableOfOrganizationFilterInput>;
  role?: Maybe<EnumOperationFilterInputOfNullableOfRoleFilterInput>;
  createDate?: Maybe<ComparableOperationFilterInputOfDateTimeFilterInput>;
  evaluation?: Maybe<EvaluationFilterInput>;
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

export type ComparableOperationFilterInputOfDateTimeFilterInput = {
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

export type ListFilterInputOfFilterInputTypeOfEvaluationFilterInput = {
  all?: Maybe<EvaluationFilterInput>;
  none?: Maybe<EvaluationFilterInput>;
  some?: Maybe<EvaluationFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type EnumOperationFilterInputOfNullableOfProgressionFilterInput = {
  eq?: Maybe<Progression>;
  neq?: Maybe<Progression>;
  in?: Maybe<Array<Maybe<Progression>>>;
  nin?: Maybe<Array<Maybe<Progression>>>;
};

export type ListFilterInputOfFilterInputTypeOfParticipantFilterInput = {
  all?: Maybe<ParticipantFilterInput>;
  none?: Maybe<ParticipantFilterInput>;
  some?: Maybe<ParticipantFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputOfFilterInputTypeOfQuestionFilterInput = {
  all?: Maybe<QuestionFilterInput>;
  none?: Maybe<QuestionFilterInput>;
  some?: Maybe<QuestionFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type EnumOperationFilterInputOfNullableOfOrganizationFilterInput = {
  eq?: Maybe<Organization>;
  neq?: Maybe<Organization>;
  in?: Maybe<Array<Maybe<Organization>>>;
  nin?: Maybe<Array<Maybe<Organization>>>;
};

export type EnumOperationFilterInputOfNullableOfRoleFilterInput = {
  eq?: Maybe<Role>;
  neq?: Maybe<Role>;
  in?: Maybe<Array<Maybe<Role>>>;
  nin?: Maybe<Array<Maybe<Role>>>;
};

export type QuestionFilterInput = {
  and?: Maybe<Array<QuestionFilterInput>>;
  or?: Maybe<Array<QuestionFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  evaluationId?: Maybe<StringOperationFilterInput>;
  questionTemplateId?: Maybe<StringOperationFilterInput>;
  organization?: Maybe<EnumOperationFilterInputOfNullableOfOrganizationFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  supportNotes?: Maybe<StringOperationFilterInput>;
  barrier?: Maybe<EnumOperationFilterInputOfNullableOfBarrierFilterInput>;
  createDate?: Maybe<ComparableOperationFilterInputOfDateTimeFilterInput>;
  answers?: Maybe<ListFilterInputOfFilterInputTypeOfAnswerFilterInput>;
  actions?: Maybe<ListFilterInputOfFilterInputTypeOfActionFilterInput>;
  evaluation?: Maybe<EvaluationFilterInput>;
  questionTemplate?: Maybe<QuestionTemplateFilterInput>;
};

export type EnumOperationFilterInputOfNullableOfBarrierFilterInput = {
  eq?: Maybe<Barrier>;
  neq?: Maybe<Barrier>;
  in?: Maybe<Array<Maybe<Barrier>>>;
  nin?: Maybe<Array<Maybe<Barrier>>>;
};

export type ListFilterInputOfFilterInputTypeOfAnswerFilterInput = {
  all?: Maybe<AnswerFilterInput>;
  none?: Maybe<AnswerFilterInput>;
  some?: Maybe<AnswerFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputOfFilterInputTypeOfActionFilterInput = {
  all?: Maybe<ActionFilterInput>;
  none?: Maybe<ActionFilterInput>;
  some?: Maybe<ActionFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type QuestionTemplateFilterInput = {
  and?: Maybe<Array<QuestionTemplateFilterInput>>;
  or?: Maybe<Array<QuestionTemplateFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  status?: Maybe<EnumOperationFilterInputOfNullableOfStatusFilterInput>;
  organization?: Maybe<EnumOperationFilterInputOfNullableOfOrganizationFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  supportNotes?: Maybe<StringOperationFilterInput>;
  barrier?: Maybe<EnumOperationFilterInputOfNullableOfBarrierFilterInput>;
  createDate?: Maybe<ComparableOperationFilterInputOfDateTimeFilterInput>;
  questions?: Maybe<ListFilterInputOfFilterInputTypeOfQuestionFilterInput>;
};

export type AnswerFilterInput = {
  and?: Maybe<Array<AnswerFilterInput>>;
  or?: Maybe<Array<AnswerFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  questionId?: Maybe<StringOperationFilterInput>;
  progression?: Maybe<EnumOperationFilterInputOfNullableOfProgressionFilterInput>;
  severity?: Maybe<EnumOperationFilterInputOfNullableOfSeverityFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  createDate?: Maybe<ComparableOperationFilterInputOfDateTimeFilterInput>;
  answeredBy?: Maybe<ParticipantFilterInput>;
  question?: Maybe<QuestionFilterInput>;
};

export type ActionFilterInput = {
  and?: Maybe<Array<ActionFilterInput>>;
  or?: Maybe<Array<ActionFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  questionId?: Maybe<StringOperationFilterInput>;
  assignedTo?: Maybe<ParticipantFilterInput>;
  title?: Maybe<StringOperationFilterInput>;
  description?: Maybe<StringOperationFilterInput>;
  priority?: Maybe<EnumOperationFilterInputOfNullableOfPriorityFilterInput>;
  onHold?: Maybe<BooleanOperationFilterInput>;
  dueDate?: Maybe<ComparableOperationFilterInputOfDateTimeFilterInput>;
  createDate?: Maybe<ComparableOperationFilterInputOfDateTimeFilterInput>;
  createdBy?: Maybe<ParticipantFilterInput>;
  notes?: Maybe<ListFilterInputOfFilterInputTypeOfNoteFilterInput>;
  question?: Maybe<QuestionFilterInput>;
};

export type EnumOperationFilterInputOfNullableOfStatusFilterInput = {
  eq?: Maybe<Status>;
  neq?: Maybe<Status>;
  in?: Maybe<Array<Maybe<Status>>>;
  nin?: Maybe<Array<Maybe<Status>>>;
};

export type EnumOperationFilterInputOfNullableOfSeverityFilterInput = {
  eq?: Maybe<Severity>;
  neq?: Maybe<Severity>;
  in?: Maybe<Array<Maybe<Severity>>>;
  nin?: Maybe<Array<Maybe<Severity>>>;
};

export type EnumOperationFilterInputOfNullableOfPriorityFilterInput = {
  eq?: Maybe<Priority>;
  neq?: Maybe<Priority>;
  in?: Maybe<Array<Maybe<Priority>>>;
  nin?: Maybe<Array<Maybe<Priority>>>;
};

export type BooleanOperationFilterInput = {
  eq?: Maybe<Scalars['Boolean']>;
  neq?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputOfFilterInputTypeOfNoteFilterInput = {
  all?: Maybe<NoteFilterInput>;
  none?: Maybe<NoteFilterInput>;
  some?: Maybe<NoteFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type NoteFilterInput = {
  and?: Maybe<Array<NoteFilterInput>>;
  or?: Maybe<Array<NoteFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  actionId?: Maybe<StringOperationFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  createdBy?: Maybe<ParticipantFilterInput>;
  createDate?: Maybe<ComparableOperationFilterInputOfDateTimeFilterInput>;
  action?: Maybe<ActionFilterInput>;
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

export enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export enum Priority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH'
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

export type Note = {
  __typename?: 'Note';
  id: Scalars['String'];
  actionId: Scalars['String'];
  text?: Maybe<Scalars['String']>;
  createdBy?: Maybe<Participant>;
  createDate: Scalars['DateTime'];
  action?: Maybe<Action>;
};

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
