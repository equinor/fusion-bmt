export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type Action = {
  __typename?: 'Action';
  assignedTo?: Maybe<Participant>;
  closingRemarks: Array<Maybe<ClosingRemark>>;
  completed: Scalars['Boolean']['output'];
  createDate: Scalars['DateTime']['output'];
  createdBy?: Maybe<Participant>;
  description: Scalars['String']['output'];
  dueDate: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isVoided: Scalars['Boolean']['output'];
  notes: Array<Maybe<Note>>;
  onHold: Scalars['Boolean']['output'];
  priority: Priority;
  question: Question;
  title: Scalars['String']['output'];
};

export type ActionFilterInput = {
  and?: InputMaybe<Array<ActionFilterInput>>;
  assignedTo?: InputMaybe<ParticipantFilterInput>;
  closingRemarks?: InputMaybe<ListFilterInputTypeOfClosingRemarkFilterInput>;
  completed?: InputMaybe<BooleanOperationFilterInput>;
  createDate?: InputMaybe<DateTimeOperationFilterInput>;
  createdBy?: InputMaybe<ParticipantFilterInput>;
  description?: InputMaybe<StringOperationFilterInput>;
  dueDate?: InputMaybe<DateTimeOperationFilterInput>;
  id?: InputMaybe<StringOperationFilterInput>;
  isVoided?: InputMaybe<BooleanOperationFilterInput>;
  notes?: InputMaybe<ListFilterInputTypeOfNoteFilterInput>;
  onHold?: InputMaybe<BooleanOperationFilterInput>;
  or?: InputMaybe<Array<ActionFilterInput>>;
  priority?: InputMaybe<PriorityOperationFilterInput>;
  question?: InputMaybe<QuestionFilterInput>;
  title?: InputMaybe<StringOperationFilterInput>;
};

export type Answer = {
  __typename?: 'Answer';
  answeredBy?: Maybe<Participant>;
  answeredById?: Maybe<Scalars['String']['output']>;
  createDate: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  progression: Progression;
  question: Question;
  questionId: Scalars['String']['output'];
  severity: Severity;
  text: Scalars['String']['output'];
};

export type AnswerFilterInput = {
  and?: InputMaybe<Array<AnswerFilterInput>>;
  answeredBy?: InputMaybe<ParticipantFilterInput>;
  answeredById?: InputMaybe<StringOperationFilterInput>;
  createDate?: InputMaybe<DateTimeOperationFilterInput>;
  id?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<AnswerFilterInput>>;
  progression?: InputMaybe<ProgressionOperationFilterInput>;
  question?: InputMaybe<QuestionFilterInput>;
  questionId?: InputMaybe<StringOperationFilterInput>;
  severity?: InputMaybe<SeverityOperationFilterInput>;
  text?: InputMaybe<StringOperationFilterInput>;
};

export enum ApplyPolicy {
  AfterResolver = 'AFTER_RESOLVER',
  BeforeResolver = 'BEFORE_RESOLVER',
  Validation = 'VALIDATION'
}

export type BmtScore = {
  __typename?: 'BMTScore';
  value: Scalars['Float']['output'];
};

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
  eq?: InputMaybe<Barrier>;
  in?: InputMaybe<Array<Barrier>>;
  neq?: InputMaybe<Barrier>;
  nin?: InputMaybe<Array<Barrier>>;
};

export type BooleanOperationFilterInput = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  neq?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ClosingRemark = {
  __typename?: 'ClosingRemark';
  action: Action;
  createDate: Scalars['DateTime']['output'];
  createdBy?: Maybe<Participant>;
  id: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type ClosingRemarkFilterInput = {
  action?: InputMaybe<ActionFilterInput>;
  and?: InputMaybe<Array<ClosingRemarkFilterInput>>;
  createDate?: InputMaybe<DateTimeOperationFilterInput>;
  createdBy?: InputMaybe<ParticipantFilterInput>;
  id?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<ClosingRemarkFilterInput>>;
  text?: InputMaybe<StringOperationFilterInput>;
};

export type DateTimeOperationFilterInput = {
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  neq?: InputMaybe<Scalars['DateTime']['input']>;
  ngt?: InputMaybe<Scalars['DateTime']['input']>;
  ngte?: InputMaybe<Scalars['DateTime']['input']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  nlt?: InputMaybe<Scalars['DateTime']['input']>;
  nlte?: InputMaybe<Scalars['DateTime']['input']>;
};

export type Evaluation = {
  __typename?: 'Evaluation';
  createDate: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  indicatorActivityDate?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  participants: Array<Maybe<Participant>>;
  previousEvaluationId?: Maybe<Scalars['String']['output']>;
  progression: Progression;
  project: Project;
  projectId: Scalars['String']['output'];
  questions: Array<Maybe<Question>>;
  status: Status;
  summary?: Maybe<Scalars['String']['output']>;
  workshopCompleteDate?: Maybe<Scalars['DateTime']['output']>;
};

export type EvaluationFilterInput = {
  and?: InputMaybe<Array<EvaluationFilterInput>>;
  createDate?: InputMaybe<DateTimeOperationFilterInput>;
  id?: InputMaybe<StringOperationFilterInput>;
  indicatorActivityDate?: InputMaybe<DateTimeOperationFilterInput>;
  name?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<EvaluationFilterInput>>;
  participants?: InputMaybe<ListFilterInputTypeOfParticipantFilterInput>;
  previousEvaluationId?: InputMaybe<StringOperationFilterInput>;
  progression?: InputMaybe<ProgressionOperationFilterInput>;
  project?: InputMaybe<ProjectFilterInput>;
  projectId?: InputMaybe<StringOperationFilterInput>;
  questions?: InputMaybe<ListFilterInputTypeOfQuestionFilterInput>;
  status?: InputMaybe<StatusOperationFilterInput>;
  summary?: InputMaybe<StringOperationFilterInput>;
  workshopCompleteDate?: InputMaybe<DateTimeOperationFilterInput>;
};

export type GraphQuery = {
  __typename?: 'GraphQuery';
  actions?: Maybe<Array<Maybe<Action>>>;
  answers?: Maybe<Array<Maybe<Answer>>>;
  closingRemarks?: Maybe<Array<Maybe<ClosingRemark>>>;
  evaluations?: Maybe<Array<Maybe<Evaluation>>>;
  notes?: Maybe<Array<Maybe<Note>>>;
  participants?: Maybe<Array<Maybe<Participant>>>;
  project?: Maybe<Project>;
  projectCategory?: Maybe<Array<Maybe<ProjectCategory>>>;
  projects?: Maybe<Array<Maybe<Project>>>;
  questionTemplates?: Maybe<Array<Maybe<QuestionTemplate>>>;
  questions?: Maybe<Array<Maybe<Question>>>;
};


export type GraphQueryActionsArgs = {
  where?: InputMaybe<ActionFilterInput>;
};


export type GraphQueryAnswersArgs = {
  where?: InputMaybe<AnswerFilterInput>;
};


export type GraphQueryClosingRemarksArgs = {
  where?: InputMaybe<ClosingRemarkFilterInput>;
};


export type GraphQueryEvaluationsArgs = {
  where?: InputMaybe<EvaluationFilterInput>;
};


export type GraphQueryNotesArgs = {
  where?: InputMaybe<NoteFilterInput>;
};


export type GraphQueryParticipantsArgs = {
  where?: InputMaybe<ParticipantFilterInput>;
};


export type GraphQueryProjectArgs = {
  externalID?: InputMaybe<Scalars['String']['input']>;
  fusionProjectID?: InputMaybe<Scalars['String']['input']>;
};


export type GraphQueryProjectCategoryArgs = {
  where?: InputMaybe<ProjectCategoryFilterInput>;
};


export type GraphQueryProjectsArgs = {
  where?: InputMaybe<ProjectFilterInput>;
};


export type GraphQueryQuestionTemplatesArgs = {
  where?: InputMaybe<QuestionTemplateFilterInput>;
};


export type GraphQueryQuestionsArgs = {
  where?: InputMaybe<QuestionFilterInput>;
};

export type IntOperationFilterInput = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  neq?: InputMaybe<Scalars['Int']['input']>;
  ngt?: InputMaybe<Scalars['Int']['input']>;
  ngte?: InputMaybe<Scalars['Int']['input']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  nlt?: InputMaybe<Scalars['Int']['input']>;
  nlte?: InputMaybe<Scalars['Int']['input']>;
};

export type ListFilterInputTypeOfActionFilterInput = {
  all?: InputMaybe<ActionFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<ActionFilterInput>;
  some?: InputMaybe<ActionFilterInput>;
};

export type ListFilterInputTypeOfAnswerFilterInput = {
  all?: InputMaybe<AnswerFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<AnswerFilterInput>;
  some?: InputMaybe<AnswerFilterInput>;
};

export type ListFilterInputTypeOfClosingRemarkFilterInput = {
  all?: InputMaybe<ClosingRemarkFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<ClosingRemarkFilterInput>;
  some?: InputMaybe<ClosingRemarkFilterInput>;
};

export type ListFilterInputTypeOfEvaluationFilterInput = {
  all?: InputMaybe<EvaluationFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<EvaluationFilterInput>;
  some?: InputMaybe<EvaluationFilterInput>;
};

export type ListFilterInputTypeOfNoteFilterInput = {
  all?: InputMaybe<NoteFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<NoteFilterInput>;
  some?: InputMaybe<NoteFilterInput>;
};

export type ListFilterInputTypeOfParticipantFilterInput = {
  all?: InputMaybe<ParticipantFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<ParticipantFilterInput>;
  some?: InputMaybe<ParticipantFilterInput>;
};

export type ListFilterInputTypeOfProjectCategoryFilterInput = {
  all?: InputMaybe<ProjectCategoryFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<ProjectCategoryFilterInput>;
  some?: InputMaybe<ProjectCategoryFilterInput>;
};

export type ListFilterInputTypeOfQuestionFilterInput = {
  all?: InputMaybe<QuestionFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<QuestionFilterInput>;
  some?: InputMaybe<QuestionFilterInput>;
};

export type ListFilterInputTypeOfQuestionTemplateFilterInput = {
  all?: InputMaybe<QuestionTemplateFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<QuestionTemplateFilterInput>;
  some?: InputMaybe<QuestionTemplateFilterInput>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addToProjectCategory?: Maybe<QuestionTemplate>;
  copyProjectCategory?: Maybe<ProjectCategory>;
  createAction?: Maybe<Action>;
  createClosingRemark?: Maybe<ClosingRemark>;
  createEvaluation?: Maybe<Evaluation>;
  createNote?: Maybe<Note>;
  createParticipant?: Maybe<Participant>;
  createProjectCategory?: Maybe<ProjectCategory>;
  createQuestionTemplate?: Maybe<QuestionTemplate>;
  deleteParticipant?: Maybe<Participant>;
  deleteProjectCategory?: Maybe<ProjectCategory>;
  deleteQuestionTemplate?: Maybe<QuestionTemplate>;
  editAction?: Maybe<Action>;
  editQuestionTemplate?: Maybe<QuestionTemplate>;
  generateBMTScore?: Maybe<BmtScore>;
  progressEvaluation?: Maybe<Evaluation>;
  progressParticipant?: Maybe<Participant>;
  removeFromProjectCategories?: Maybe<QuestionTemplate>;
  reorderQuestionTemplate?: Maybe<QuestionTemplate>;
  setAnswer?: Maybe<Answer>;
  setEvaluationStatus?: Maybe<Evaluation>;
  setEvaluationToAnotherProject?: Maybe<Evaluation>;
  setIndicatorEvaluation?: Maybe<Project>;
  setSummary?: Maybe<Evaluation>;
  voidAction?: Maybe<Action>;
};


export type MutationAddToProjectCategoryArgs = {
  projectCategoryId?: InputMaybe<Scalars['String']['input']>;
  questionTemplateId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCopyProjectCategoryArgs = {
  newName?: InputMaybe<Scalars['String']['input']>;
  projectCategoryId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateActionArgs = {
  assignedToId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate: Scalars['DateTime']['input'];
  priority: Priority;
  questionId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateClosingRemarkArgs = {
  actionId?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateEvaluationArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
  previousEvaluationId?: InputMaybe<Scalars['String']['input']>;
  projectCategoryId?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateNoteArgs = {
  actionId?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateParticipantArgs = {
  azureUniqueId?: InputMaybe<Scalars['String']['input']>;
  evaluationId?: InputMaybe<Scalars['String']['input']>;
  organization: Organization;
  role: Role;
};


export type MutationCreateProjectCategoryArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateQuestionTemplateArgs = {
  barrier: Barrier;
  newOrder?: Scalars['Int']['input'];
  organization: Organization;
  projectCategoryIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  supportNotes?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteParticipantArgs = {
  participantId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteProjectCategoryArgs = {
  projectCategoryId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteQuestionTemplateArgs = {
  questionTemplateId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationEditActionArgs = {
  actionId?: InputMaybe<Scalars['String']['input']>;
  assignedToId?: InputMaybe<Scalars['String']['input']>;
  completed: Scalars['Boolean']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate: Scalars['DateTime']['input'];
  onHold: Scalars['Boolean']['input'];
  priority: Priority;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationEditQuestionTemplateArgs = {
  barrier: Barrier;
  organization: Organization;
  questionTemplateId?: InputMaybe<Scalars['String']['input']>;
  status: Status;
  supportNotes?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};


export type MutationGenerateBmtScoreArgs = {
  evaluationId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationProgressEvaluationArgs = {
  evaluationId?: InputMaybe<Scalars['String']['input']>;
  newProgression: Progression;
};


export type MutationProgressParticipantArgs = {
  evaluationId?: InputMaybe<Scalars['String']['input']>;
  newProgression: Progression;
};


export type MutationRemoveFromProjectCategoriesArgs = {
  projectCategoryIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  questionTemplateId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationReorderQuestionTemplateArgs = {
  newNextQuestionTemplateId?: InputMaybe<Scalars['String']['input']>;
  questionTemplateId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetAnswerArgs = {
  progression: Progression;
  questionId?: InputMaybe<Scalars['String']['input']>;
  severity: Severity;
  text?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetEvaluationStatusArgs = {
  evaluationId?: InputMaybe<Scalars['String']['input']>;
  newStatus: Status;
};


export type MutationSetEvaluationToAnotherProjectArgs = {
  destinationProjectExternalId?: InputMaybe<Scalars['String']['input']>;
  destinationProjectFusionId?: InputMaybe<Scalars['String']['input']>;
  evaluationId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetIndicatorEvaluationArgs = {
  evaluationId?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetSummaryArgs = {
  evaluationId?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
};


export type MutationVoidActionArgs = {
  actionId?: InputMaybe<Scalars['String']['input']>;
};

export type Note = {
  __typename?: 'Note';
  action: Action;
  createDate: Scalars['DateTime']['output'];
  createdBy?: Maybe<Participant>;
  id: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type NoteFilterInput = {
  action?: InputMaybe<ActionFilterInput>;
  and?: InputMaybe<Array<NoteFilterInput>>;
  createDate?: InputMaybe<DateTimeOperationFilterInput>;
  createdBy?: InputMaybe<ParticipantFilterInput>;
  id?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<NoteFilterInput>>;
  text?: InputMaybe<StringOperationFilterInput>;
};

export enum Organization {
  All = 'ALL',
  Commissioning = 'COMMISSIONING',
  Construction = 'CONSTRUCTION',
  Engineering = 'ENGINEERING',
  PreOps = 'PRE_OPS'
}

export type OrganizationOperationFilterInput = {
  eq?: InputMaybe<Organization>;
  in?: InputMaybe<Array<Organization>>;
  neq?: InputMaybe<Organization>;
  nin?: InputMaybe<Array<Organization>>;
};

export type Participant = {
  __typename?: 'Participant';
  azureUniqueId: Scalars['String']['output'];
  createDate: Scalars['DateTime']['output'];
  evaluation: Evaluation;
  evaluationId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  organization: Organization;
  progression: Progression;
  role: Role;
};

export type ParticipantFilterInput = {
  and?: InputMaybe<Array<ParticipantFilterInput>>;
  azureUniqueId?: InputMaybe<StringOperationFilterInput>;
  createDate?: InputMaybe<DateTimeOperationFilterInput>;
  evaluation?: InputMaybe<EvaluationFilterInput>;
  evaluationId?: InputMaybe<StringOperationFilterInput>;
  id?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<ParticipantFilterInput>>;
  organization?: InputMaybe<OrganizationOperationFilterInput>;
  progression?: InputMaybe<ProgressionOperationFilterInput>;
  role?: InputMaybe<RoleOperationFilterInput>;
};

export enum Priority {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export type PriorityOperationFilterInput = {
  eq?: InputMaybe<Priority>;
  in?: InputMaybe<Array<Priority>>;
  neq?: InputMaybe<Priority>;
  nin?: InputMaybe<Array<Priority>>;
};

export enum Progression {
    Nomination = 'NOMINATION',
    Individual = 'INDIVIDUAL',
    Preparation = 'PREPARATION',
    Workshop = 'WORKSHOP',
    FollowUp = 'FOLLOW_UP',
    Finished = 'FINISHED'
}

export type ProgressionOperationFilterInput = {
  eq?: InputMaybe<Progression>;
  in?: InputMaybe<Array<Progression>>;
  neq?: InputMaybe<Progression>;
  nin?: InputMaybe<Array<Progression>>;
};

export type Project = {
  __typename?: 'Project';
  createDate: Scalars['DateTime']['output'];
  evaluations: Array<Maybe<Evaluation>>;
  externalId: Scalars['String']['output'];
  fusionProjectId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  indicatorEvaluationId?: Maybe<Scalars['String']['output']>;
};

export type ProjectCategory = {
  __typename?: 'ProjectCategory';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  questionTemplates: Array<Maybe<QuestionTemplate>>;
};

export type ProjectCategoryFilterInput = {
  and?: InputMaybe<Array<ProjectCategoryFilterInput>>;
  id?: InputMaybe<StringOperationFilterInput>;
  name?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<ProjectCategoryFilterInput>>;
  questionTemplates?: InputMaybe<ListFilterInputTypeOfQuestionTemplateFilterInput>;
};

export type ProjectFilterInput = {
  and?: InputMaybe<Array<ProjectFilterInput>>;
  createDate?: InputMaybe<DateTimeOperationFilterInput>;
  evaluations?: InputMaybe<ListFilterInputTypeOfEvaluationFilterInput>;
  externalId?: InputMaybe<StringOperationFilterInput>;
  fusionProjectId?: InputMaybe<StringOperationFilterInput>;
  id?: InputMaybe<StringOperationFilterInput>;
  indicatorEvaluationId?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<ProjectFilterInput>>;
};

export type Question = {
  __typename?: 'Question';
  actions: Array<Maybe<Action>>;
  answers: Array<Maybe<Answer>>;
  barrier: Barrier;
  createDate: Scalars['DateTime']['output'];
  evaluation: Evaluation;
  id: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  organization: Organization;
  questionTemplate: QuestionTemplate;
  supportNotes: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type QuestionFilterInput = {
  actions?: InputMaybe<ListFilterInputTypeOfActionFilterInput>;
  and?: InputMaybe<Array<QuestionFilterInput>>;
  answers?: InputMaybe<ListFilterInputTypeOfAnswerFilterInput>;
  barrier?: InputMaybe<BarrierOperationFilterInput>;
  createDate?: InputMaybe<DateTimeOperationFilterInput>;
  evaluation?: InputMaybe<EvaluationFilterInput>;
  id?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<QuestionFilterInput>>;
  order?: InputMaybe<IntOperationFilterInput>;
  organization?: InputMaybe<OrganizationOperationFilterInput>;
  questionTemplate?: InputMaybe<QuestionTemplateFilterInput>;
  supportNotes?: InputMaybe<StringOperationFilterInput>;
  text?: InputMaybe<StringOperationFilterInput>;
};

export type QuestionTemplate = {
  __typename?: 'QuestionTemplate';
  adminOrder: Scalars['Int']['output'];
  barrier: Barrier;
  createDate: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  organization: Organization;
  previous?: Maybe<QuestionTemplate>;
  projectCategories: Array<Maybe<ProjectCategory>>;
  questions: Array<Maybe<Question>>;
  status: Status;
  supportNotes: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type QuestionTemplateFilterInput = {
  adminOrder?: InputMaybe<IntOperationFilterInput>;
  and?: InputMaybe<Array<QuestionTemplateFilterInput>>;
  barrier?: InputMaybe<BarrierOperationFilterInput>;
  createDate?: InputMaybe<DateTimeOperationFilterInput>;
  id?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<QuestionTemplateFilterInput>>;
  order?: InputMaybe<IntOperationFilterInput>;
  organization?: InputMaybe<OrganizationOperationFilterInput>;
  previous?: InputMaybe<QuestionTemplateFilterInput>;
  projectCategories?: InputMaybe<ListFilterInputTypeOfProjectCategoryFilterInput>;
  questions?: InputMaybe<ListFilterInputTypeOfQuestionFilterInput>;
  status?: InputMaybe<StatusOperationFilterInput>;
  supportNotes?: InputMaybe<StringOperationFilterInput>;
  text?: InputMaybe<StringOperationFilterInput>;
};

export enum Role {
  Facilitator = 'FACILITATOR',
  OrganizationLead = 'ORGANIZATION_LEAD',
  Participant = 'PARTICIPANT'
}

export type RoleOperationFilterInput = {
  eq?: InputMaybe<Role>;
  in?: InputMaybe<Array<Role>>;
  neq?: InputMaybe<Role>;
  nin?: InputMaybe<Array<Role>>;
};

export enum Severity {
  MajorIssues = 'MAJOR_ISSUES',
  Na = 'NA',
  OnTrack = 'ON_TRACK',
  SomeConcerns = 'SOME_CONCERNS'
}

export type SeverityOperationFilterInput = {
  eq?: InputMaybe<Severity>;
  in?: InputMaybe<Array<Severity>>;
  neq?: InputMaybe<Severity>;
  nin?: InputMaybe<Array<Severity>>;
};

export enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Voided = 'VOIDED'
}

export type StatusOperationFilterInput = {
  eq?: InputMaybe<Status>;
  in?: InputMaybe<Array<Status>>;
  neq?: InputMaybe<Status>;
  nin?: InputMaybe<Array<Status>>;
};

export type StringOperationFilterInput = {
  and?: InputMaybe<Array<StringOperationFilterInput>>;
  contains?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  eq?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  ncontains?: InputMaybe<Scalars['String']['input']>;
  nendsWith?: InputMaybe<Scalars['String']['input']>;
  neq?: InputMaybe<Scalars['String']['input']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  nstartsWith?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<StringOperationFilterInput>>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};