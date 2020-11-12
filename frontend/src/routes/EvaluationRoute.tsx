import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Stepper, Step } from '@equinor/fusion-components';

import NominationView from '../views/Evaluation/Nomination/NominationView';
import { Answer, Barrier, Evaluation, Organization, Participant, Progression, Project, Question, QuestionTemplate, Role, Severity, Status } from '../api/models';
import PreparationView from '../views/Evaluation/Preparation/PreparationView';

interface Params {
    fusionProjectId: string
    evaluationId: string
}

const EvaluationRoute = ({match}: RouteComponentProps<Params>) => {
    const [currentStep, setCurrentStep] = React.useState<Progression>(Progression.Nomination);

    const project: Project = {
        createDate: new Date(),
        evaluations: [],
        fusionProjectId: "fusion-project-id",
        id: "project-id"
    }

    const evaluation: Evaluation = {
        createDate: new Date(),
        id: "evaluation-id",
        name: "Evaluation name",
        participants: [],
        progression: Progression.Alignment,
        project: project,
        projectId: "project-id",
        questions: []
    }

    const participant: Participant = {
        createDate: new Date(),
        evaluation: evaluation,
        evaluationId: evaluation.id,
        azureUniqueId: "fusion-id",
        id: "participant-id",
        organization: Organization.PreOps,
        role: Role.ReadOnly
    }

    const template: QuestionTemplate = {
        barrier: Barrier.Gm,
        createDate: new Date(),
        id: "template-id",
        organization: Organization.All,
        questions: [],
        status: Status.Active,
        supportNotes: "",
        text: ""
    }

    const dummyQuestion: Question = {
        actions: [],
        answers: [],
        barrier: Barrier.Gm,
        createDate: new Date(),
        evaluation: evaluation,
        evaluationId: evaluation.id,
        id: "question-id",
        organization: Organization.Engineering,
        supportNotes: "There are the support notes",
        text: "This is the question text",
        questionTemplate: template,
        questionTemplateId: template.id
    }

    const dummyQuestion2: Question = {
        actions: [],
        answers: [],
        barrier: Barrier.Gm,
        createDate: new Date(),
        evaluation: evaluation,
        evaluationId: evaluation.id,
        id: "question-id",
        organization: Organization.Engineering,
        supportNotes: "There are the support notes",
        text: "This is the question text",
        questionTemplate: template,
        questionTemplateId: template.id
    }

    const dummyQuestion3: Question = {
        actions: [],
        answers: [],
        barrier: Barrier.Ps1,
        createDate: new Date(),
        evaluation: evaluation,
        evaluationId: evaluation.id,
        id: "question-id",
        organization: Organization.Engineering,
        supportNotes: "There are the support notes",
        text: "This is the question text",
        questionTemplate: template,
        questionTemplateId: template.id
    }

    const dummyAnswer: Answer = {
        answeredBy: participant,
        createDate: new Date(),
        id: "answer-id",
        progression: Progression.Alignment,
        question: dummyQuestion,
        questionId: dummyQuestion.id,
        severity: Severity.High,
        text: "Answer text",
    }

    project.evaluations = [evaluation]
    evaluation.participants = [participant]
    evaluation.questions = [dummyQuestion, dummyQuestion2, dummyQuestion3]
    dummyQuestion.answers = [dummyAnswer]
    dummyQuestion2.answers = [dummyAnswer]
    dummyQuestion3.answers = [dummyAnswer]

    return (
        <>
            <Stepper
                forceOrder={false}
                activeStepKey={currentStep}
                hideNavButtons={true}
            >
                <Step
                    title="Nomination"
                    description="In progress"
                    stepKey={Progression.Nomination}
                >
                    <NominationView
                        evaluationTitle="Evaluation Name"
                        onNextStep={() => setCurrentStep(Progression.Preparation)}
                    />
                </Step>
                <Step
                    title="Preparation"
                    description=""
                    stepKey={Progression.Preparation}
                >
                    <>
                        <PreparationView evaluation={evaluation} participant={participant}/>
                    </>
                </Step>
                <Step
                    title="Alignment"
                    description=""
                    stepKey={Progression.Alignment}
                >
                    <h1>Alignment</h1>
                </Step>
                <Step
                    title="Workshop"
                    description=""
                    stepKey={Progression.Workshop}
                >
                    <h1>Workshop</h1>
                </Step>
                <Step
                    title="Follow-up"
                    description=""
                    stepKey={Progression.FollowUp}
                >
                    <h1>Follow-up</h1>
                </Step>
            </Stepper>
        </>
    );
};

export default EvaluationRoute;
