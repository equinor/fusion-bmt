export type Maybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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




export type Action = {
  __typename?: 'Action';
  id: Scalars['String'];
  assignedTo?: Maybe<Participant>;
  title: Scalars['String'];
  description: Scalars['String'];
  priority: Priority;
  onHold: Scalars['Boolean'];
  completed: Scalars['Boolean'];
  dueDate: Scalars['DateTime'];
  createDate: Scalars['DateTime'];
  createdBy?: Maybe<Participant>;
  notes: Array<Maybe<Note>>;
  closingRemarks: Array<Maybe<ClosingRemark>>;
  question: Question;
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
  completed?: Maybe<BooleanOperationFilterInput>;
  dueDate?: Maybe<ComparableDateTimeOffsetOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOffsetOperationFilterInput>;
  createdBy?: Maybe<ParticipantFilterInput>;
  notes?: Maybe<ListFilterInputTypeOfNoteFilterInput>;
  closingRemarks?: Maybe<ListFilterInputTypeOfClosingRemarkFilterInput>;
  question?: Maybe<QuestionFilterInput>;
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

export type AnswerFilterInput = {
  and?: Maybe<Array<AnswerFilterInput>>;
  or?: Maybe<Array<AnswerFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  progression?: Maybe<ProgressionOperationFilterInput>;
  severity?: Maybe<SeverityOperationFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOffsetOperationFilterInput>;
  answeredById?: Maybe<StringOperationFilterInput>;
  answeredBy?: Maybe<ParticipantFilterInput>;
  questionId?: Maybe<StringOperationFilterInput>;
  question?: Maybe<QuestionFilterInput>;
};

export enum ApplyPolicy {
  BeforeResolver = 'BEFORE_RESOLVER',
  AfterResolver = 'AFTER_RESOLVER'
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

export type BarrierOperationFilterInput = {
  eq?: Maybe<Barrier>;
  neq?: Maybe<Barrier>;
  in?: Maybe<Array<Barrier>>;
  nin?: Maybe<Array<Barrier>>;
};

export type BooleanOperationFilterInput = {
  eq?: Maybe<Scalars['Boolean']>;
  neq?: Maybe<Scalars['Boolean']>;
};

export type ClosingRemark = {
  __typename?: 'ClosingRemark';
  id: Scalars['String'];
  text: Scalars['String'];
  createdBy?: Maybe<Participant>;
  createDate: Scalars['DateTime'];
  action: Action;
};

export type ClosingRemarkFilterInput = {
  and?: Maybe<Array<ClosingRemarkFilterInput>>;
  or?: Maybe<Array<ClosingRemarkFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  createdBy?: Maybe<ParticipantFilterInput>;
  createDate?: Maybe<ComparableDateTimeOffsetOperationFilterInput>;
  action?: Maybe<ActionFilterInput>;
};

export type ComparableDateTimeOffsetOperationFilterInput = {
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

export type ComparableInt32OperationFilterInput = {
  eq?: Maybe<Scalars['Int']>;
  neq?: Maybe<Scalars['Int']>;
  in?: Maybe<Array<Scalars['Int']>>;
  nin?: Maybe<Array<Scalars['Int']>>;
  gt?: Maybe<Scalars['Int']>;
  ngt?: Maybe<Scalars['Int']>;
  gte?: Maybe<Scalars['Int']>;
  ngte?: Maybe<Scalars['Int']>;
  lt?: Maybe<Scalars['Int']>;
  nlt?: Maybe<Scalars['Int']>;
  lte?: Maybe<Scalars['Int']>;
  nlte?: Maybe<Scalars['Int']>;
};

export type ComparableNullableOfDateTimeOffsetOperationFilterInput = {
  eq?: Maybe<Scalars['DateTime']>;
  neq?: Maybe<Scalars['DateTime']>;
  in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  nin?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  gt?: Maybe<Scalars['DateTime']>;
  ngt?: Maybe<Scalars['DateTime']>;
  gte?: Maybe<Scalars['DateTime']>;
  ngte?: Maybe<Scalars['DateTime']>;
  lt?: Maybe<Scalars['DateTime']>;
  nlt?: Maybe<Scalars['DateTime']>;
  lte?: Maybe<Scalars['DateTime']>;
  nlte?: Maybe<Scalars['DateTime']>;
};


export type Evaluation = {
  __typename?: 'Evaluation';
  id: Scalars['String'];
  name: Scalars['String'];
  createDate: Scalars['DateTime'];
  progression: Progression;
  status: Status;
  participants: Array<Maybe<Participant>>;
  questions: Array<Maybe<Question>>;
  project: Project;
  summary?: Maybe<Scalars['String']>;
  previousEvaluationId?: Maybe<Scalars['String']>;
  workshopCompleteDate?: Maybe<Scalars['DateTime']>;
};

export type EvaluationFilterInput = {
  and?: Maybe<Array<EvaluationFilterInput>>;
  or?: Maybe<Array<EvaluationFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  name?: Maybe<StringOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOffsetOperationFilterInput>;
  progression?: Maybe<ProgressionOperationFilterInput>;
  status?: Maybe<StatusOperationFilterInput>;
  participants?: Maybe<ListFilterInputTypeOfParticipantFilterInput>;
  questions?: Maybe<ListFilterInputTypeOfQuestionFilterInput>;
  project?: Maybe<ProjectFilterInput>;
  summary?: Maybe<StringOperationFilterInput>;
  previousEvaluationId?: Maybe<StringOperationFilterInput>;
  workshopCompleteDate?: Maybe<ComparableNullableOfDateTimeOffsetOperationFilterInput>;
};

export type GraphQuery = {
  __typename?: 'GraphQuery';
  projects?: Maybe<Array<Maybe<Project>>>;
  project?: Maybe<Project>;
  evaluations?: Maybe<Array<Maybe<Evaluation>>>;
  participants?: Maybe<Array<Maybe<Participant>>>;
  questions?: Maybe<Array<Maybe<Question>>>;
  questionTemplates?: Maybe<Array<Maybe<QuestionTemplate>>>;
  answers?: Maybe<Array<Maybe<Answer>>>;
  actions?: Maybe<Array<Maybe<Action>>>;
  notes?: Maybe<Array<Maybe<Note>>>;
  closingRemarks?: Maybe<Array<Maybe<ClosingRemark>>>;
  projectCategory?: Maybe<Array<Maybe<ProjectCategory>>>;
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


export type GraphQueryQuestionTemplatesArgs = {
  where?: Maybe<QuestionTemplateFilterInput>;
};


export type GraphQueryAnswersArgs = {
  where?: Maybe<AnswerFilterInput>;
};


export type GraphQueryActionsArgs = {
  where?: Maybe<ActionFilterInput>;
};


export type GraphQueryNotesArgs = {
  where?: Maybe<NoteFilterInput>;
};


export type GraphQueryClosingRemarksArgs = {
  where?: Maybe<ClosingRemarkFilterInput>;
};


export type GraphQueryProjectCategoryArgs = {
  where?: Maybe<ProjectCategoryFilterInput>;
};

export type ListFilterInputTypeOfActionFilterInput = {
  all?: Maybe<ActionFilterInput>;
  none?: Maybe<ActionFilterInput>;
  some?: Maybe<ActionFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputTypeOfAnswerFilterInput = {
  all?: Maybe<AnswerFilterInput>;
  none?: Maybe<AnswerFilterInput>;
  some?: Maybe<AnswerFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputTypeOfClosingRemarkFilterInput = {
  all?: Maybe<ClosingRemarkFilterInput>;
  none?: Maybe<ClosingRemarkFilterInput>;
  some?: Maybe<ClosingRemarkFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputTypeOfEvaluationFilterInput = {
  all?: Maybe<EvaluationFilterInput>;
  none?: Maybe<EvaluationFilterInput>;
  some?: Maybe<EvaluationFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputTypeOfNoteFilterInput = {
  all?: Maybe<NoteFilterInput>;
  none?: Maybe<NoteFilterInput>;
  some?: Maybe<NoteFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputTypeOfParticipantFilterInput = {
  all?: Maybe<ParticipantFilterInput>;
  none?: Maybe<ParticipantFilterInput>;
  some?: Maybe<ParticipantFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputTypeOfProjectCategoryFilterInput = {
  all?: Maybe<ProjectCategoryFilterInput>;
  none?: Maybe<ProjectCategoryFilterInput>;
  some?: Maybe<ProjectCategoryFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputTypeOfQuestionFilterInput = {
  all?: Maybe<QuestionFilterInput>;
  none?: Maybe<QuestionFilterInput>;
  some?: Maybe<QuestionFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type ListFilterInputTypeOfQuestionTemplateFilterInput = {
  all?: Maybe<QuestionTemplateFilterInput>;
  none?: Maybe<QuestionTemplateFilterInput>;
  some?: Maybe<QuestionTemplateFilterInput>;
  any?: Maybe<Scalars['Boolean']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createEvaluation?: Maybe<Evaluation>;
  progressEvaluation?: Maybe<Evaluation>;
  setSummary?: Maybe<Evaluation>;
  progressParticipant?: Maybe<Participant>;
  createParticipant?: Maybe<Participant>;
  deleteParticipant?: Maybe<Participant>;
  setAnswer?: Maybe<Answer>;
  createAction?: Maybe<Action>;
  editAction?: Maybe<Action>;
  deleteAction?: Maybe<Action>;
  createNote?: Maybe<Note>;
  createClosingRemark?: Maybe<ClosingRemark>;
  createProjectCategory?: Maybe<ProjectCategory>;
  copyProjectCategory?: Maybe<ProjectCategory>;
  createQuestionTemplate?: Maybe<QuestionTemplate>;
  editQuestionTemplate?: Maybe<QuestionTemplate>;
  reorderQuestionTemplate?: Maybe<QuestionTemplate>;
  addToProjectCategory?: Maybe<QuestionTemplate>;
  removeFromProjectCategory?: Maybe<QuestionTemplate>;
};


export type MutationCreateEvaluationArgs = {
  name?: Maybe<Scalars['String']>;
  projectId?: Maybe<Scalars['String']>;
  previousEvaluationId?: Maybe<Scalars['String']>;
  projectCategoryId?: Maybe<Scalars['String']>;
};


export type MutationProgressEvaluationArgs = {
  evaluationId?: Maybe<Scalars['String']>;
  newProgression: Progression;
};


export type MutationSetSummaryArgs = {
  evaluationId?: Maybe<Scalars['String']>;
  summary?: Maybe<Scalars['String']>;
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


export type MutationCreateActionArgs = {
  questionId?: Maybe<Scalars['String']>;
  assignedToId?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  dueDate: Scalars['DateTime'];
  priority: Priority;
  title?: Maybe<Scalars['String']>;
};


export type MutationEditActionArgs = {
  actionId?: Maybe<Scalars['String']>;
  assignedToId?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  dueDate: Scalars['DateTime'];
  title?: Maybe<Scalars['String']>;
  onHold: Scalars['Boolean'];
  completed: Scalars['Boolean'];
  priority: Priority;
};


export type MutationDeleteActionArgs = {
  actionId?: Maybe<Scalars['String']>;
};


export type MutationCreateNoteArgs = {
  actionId?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
};


export type MutationCreateClosingRemarkArgs = {
  actionId?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
};


export type MutationCreateProjectCategoryArgs = {
  name?: Maybe<Scalars['String']>;
};


export type MutationCopyProjectCategoryArgs = {
  newName?: Maybe<Scalars['String']>;
  projectCategoryId?: Maybe<Scalars['String']>;
};


export type MutationCreateQuestionTemplateArgs = {
  barrier: Barrier;
  organization: Organization;
  text?: Maybe<Scalars['String']>;
  supportNotes?: Maybe<Scalars['String']>;
};


export type MutationEditQuestionTemplateArgs = {
  questionTemplateId?: Maybe<Scalars['String']>;
  barrier: Barrier;
  organization: Organization;
  text?: Maybe<Scalars['String']>;
  supportNotes?: Maybe<Scalars['String']>;
  status: Status;
};


export type MutationReorderQuestionTemplateArgs = {
  questionTemplateId?: Maybe<Scalars['String']>;
  newNextQuestionTemplateId?: Maybe<Scalars['String']>;
};


export type MutationAddToProjectCategoryArgs = {
  questionTemplateId?: Maybe<Scalars['String']>;
  projectCategoryId?: Maybe<Scalars['String']>;
};


export type MutationRemoveFromProjectCategoryArgs = {
  questionTemplateId?: Maybe<Scalars['String']>;
  projectCategoryId?: Maybe<Scalars['String']>;
};

export type Note = {
  __typename?: 'Note';
  id: Scalars['String'];
  text: Scalars['String'];
  createdBy?: Maybe<Participant>;
  createDate: Scalars['DateTime'];
  action: Action;
};

export type NoteFilterInput = {
  and?: Maybe<Array<NoteFilterInput>>;
  or?: Maybe<Array<NoteFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  createdBy?: Maybe<ParticipantFilterInput>;
  createDate?: Maybe<ComparableDateTimeOffsetOperationFilterInput>;
  action?: Maybe<ActionFilterInput>;
};

export enum Organization {
  Commissioning = 'COMMISSIONING',
  Construction = 'CONSTRUCTION',
  Engineering = 'ENGINEERING',
  PreOps = 'PRE_OPS',
  All = 'ALL'
}

export type OrganizationOperationFilterInput = {
  eq?: Maybe<Organization>;
  neq?: Maybe<Organization>;
  in?: Maybe<Array<Organization>>;
  nin?: Maybe<Array<Organization>>;
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

export type ParticipantFilterInput = {
  and?: Maybe<Array<ParticipantFilterInput>>;
  or?: Maybe<Array<ParticipantFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  azureUniqueId?: Maybe<StringOperationFilterInput>;
  organization?: Maybe<OrganizationOperationFilterInput>;
  role?: Maybe<RoleOperationFilterInput>;
  progression?: Maybe<ProgressionOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOffsetOperationFilterInput>;
  evaluationId?: Maybe<StringOperationFilterInput>;
  evaluation?: Maybe<EvaluationFilterInput>;
};

export enum Priority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH'
}

export type PriorityOperationFilterInput = {
  eq?: Maybe<Priority>;
  neq?: Maybe<Priority>;
  in?: Maybe<Array<Priority>>;
  nin?: Maybe<Array<Priority>>;
};

export enum Progression {
  Nomination = 'NOMINATION',
  Individual = 'INDIVIDUAL',
  Preparation = 'PREPARATION',
  Workshop = 'WORKSHOP',
  FollowUp = 'FOLLOW_UP'
}

export type ProgressionOperationFilterInput = {
  eq?: Maybe<Progression>;
  neq?: Maybe<Progression>;
  in?: Maybe<Array<Progression>>;
  nin?: Maybe<Array<Progression>>;
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['String'];
  fusionProjectId: Scalars['String'];
  createDate: Scalars['DateTime'];
  evaluations: Array<Maybe<Evaluation>>;
};

export type ProjectCategory = {
  __typename?: 'ProjectCategory';
  id: Scalars['String'];
  name: Scalars['String'];
  questionTemplates: Array<Maybe<QuestionTemplate>>;
};

export type ProjectCategoryFilterInput = {
  and?: Maybe<Array<ProjectCategoryFilterInput>>;
  or?: Maybe<Array<ProjectCategoryFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  name?: Maybe<StringOperationFilterInput>;
  questionTemplates?: Maybe<ListFilterInputTypeOfQuestionTemplateFilterInput>;
};

export type ProjectFilterInput = {
  and?: Maybe<Array<ProjectFilterInput>>;
  or?: Maybe<Array<ProjectFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  fusionProjectId?: Maybe<StringOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOffsetOperationFilterInput>;
  evaluations?: Maybe<ListFilterInputTypeOfEvaluationFilterInput>;
};

export type Question = {
  __typename?: 'Question';
  id: Scalars['String'];
  organization: Organization;
  text: Scalars['String'];
  order: Scalars['Int'];
  supportNotes: Scalars['String'];
  barrier: Barrier;
  createDate: Scalars['DateTime'];
  answers: Array<Maybe<Answer>>;
  actions: Array<Maybe<Action>>;
  evaluation: Evaluation;
  questionTemplate: QuestionTemplate;
};

export type QuestionFilterInput = {
  and?: Maybe<Array<QuestionFilterInput>>;
  or?: Maybe<Array<QuestionFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  organization?: Maybe<OrganizationOperationFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  order?: Maybe<ComparableInt32OperationFilterInput>;
  supportNotes?: Maybe<StringOperationFilterInput>;
  barrier?: Maybe<BarrierOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOffsetOperationFilterInput>;
  answers?: Maybe<ListFilterInputTypeOfAnswerFilterInput>;
  actions?: Maybe<ListFilterInputTypeOfActionFilterInput>;
  evaluation?: Maybe<EvaluationFilterInput>;
  questionTemplate?: Maybe<QuestionTemplateFilterInput>;
};

export type QuestionTemplate = {
  __typename?: 'QuestionTemplate';
  id: Scalars['String'];
  status: Status;
  organization: Organization;
  text: Scalars['String'];
  order: Scalars['Int'];
  supportNotes: Scalars['String'];
  barrier: Barrier;
  createDate: Scalars['DateTime'];
  questions: Array<Maybe<Question>>;
  previous?: Maybe<QuestionTemplate>;
  projectCategories: Array<Maybe<ProjectCategory>>;
};

export type QuestionTemplateFilterInput = {
  and?: Maybe<Array<QuestionTemplateFilterInput>>;
  or?: Maybe<Array<QuestionTemplateFilterInput>>;
  id?: Maybe<StringOperationFilterInput>;
  status?: Maybe<StatusOperationFilterInput>;
  organization?: Maybe<OrganizationOperationFilterInput>;
  text?: Maybe<StringOperationFilterInput>;
  order?: Maybe<ComparableInt32OperationFilterInput>;
  supportNotes?: Maybe<StringOperationFilterInput>;
  barrier?: Maybe<BarrierOperationFilterInput>;
  createDate?: Maybe<ComparableDateTimeOffsetOperationFilterInput>;
  questions?: Maybe<ListFilterInputTypeOfQuestionFilterInput>;
  previous?: Maybe<QuestionTemplateFilterInput>;
  projectCategories?: Maybe<ListFilterInputTypeOfProjectCategoryFilterInput>;
};

export enum Role {
  Participant = 'PARTICIPANT',
  Facilitator = 'FACILITATOR',
  OrganizationLead = 'ORGANIZATION_LEAD',
  ReadOnly = 'READ_ONLY'
}

export type RoleOperationFilterInput = {
  eq?: Maybe<Role>;
  neq?: Maybe<Role>;
  in?: Maybe<Array<Role>>;
  nin?: Maybe<Array<Role>>;
};

export enum Severity {
  Low = 'LOW',
  Limited = 'LIMITED',
  High = 'HIGH',
  Na = 'NA'
}

export type SeverityOperationFilterInput = {
  eq?: Maybe<Severity>;
  neq?: Maybe<Severity>;
  in?: Maybe<Array<Severity>>;
  nin?: Maybe<Array<Severity>>;
};

export enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Voided = 'VOIDED'
}

export type StatusOperationFilterInput = {
  eq?: Maybe<Status>;
  neq?: Maybe<Status>;
  in?: Maybe<Array<Status>>;
  nin?: Maybe<Array<Status>>;
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
