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
    const [currentStep, setCurrentStep] = React.useState<Progression>(Progression.NOMINATION);

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
        progression: Progression.ALIGNMENT,
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
        organization: Organization.PREOPS,
        role: Role.READONLY
    }

    const template: QuestionTemplate = {
        barrier: Barrier.GM,
        createDate: new Date(),
        id: "template-id",
        organization: Organization.ALL,
        questions: [],
        status: Status.ACTIVE,
        supportNotes: "",
        text: ""
    }

    const dummyQuestion: Question = {
        actions: [],
        answers: [],
        barrier: Barrier.GM,
        createDate: new Date(),
        evaluation: evaluation,
        evaluationId: evaluation.id,
        id: "question-id",
        organization: Organization.ENGINEERING,
        supportNotes: "There are the support notes",
        text: "This is the question text",
        questionTemplate: template,
        questionTemplateId: template.id
    }

    const dummyQuestion2: Question = {
        actions: [],
        answers: [],
        barrier: Barrier.GM,
        createDate: new Date(),
        evaluation: evaluation,
        evaluationId: evaluation.id,
        id: "question-id",
        organization: Organization.ENGINEERING,
        supportNotes: "There are the support notes",
        text: "This is the question text",
        questionTemplate: template,
        questionTemplateId: template.id
    }

    const dummyQuestion3: Question = {
        actions: [],
        answers: [],
        barrier: Barrier.PS1,
        createDate: new Date(),
        evaluation: evaluation,
        evaluationId: evaluation.id,
        id: "question-id",
        organization: Organization.ENGINEERING,
        supportNotes: "There are the support notes",
        text: "This is the question text",
        questionTemplate: template,
        questionTemplateId: template.id
    }

    const dummyAnswer: Answer = {
        answeredBy: participant,
        createDate: new Date(),
        id: "answer-id",
        progression: Progression.ALIGNMENT,
        question: dummyQuestion,
        questionId: dummyQuestion.id,
        severity: Severity.HIGH,
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
                    stepKey={Progression.NOMINATION}
                >
                    <NominationView
                        evaluationTitle="Evaluation Name"
                        onNextStep={() => setCurrentStep(Progression.PREPARATION)}
                    />
                </Step>
                <Step
                    title="Preparation"
                    description=""
                    stepKey={Progression.PREPARATION}
                >
                    <>
                        <PreparationView evaluation={evaluation} participant={participant}/>
                    </>
                </Step>
                <Step
                    title="Alignment"
                    description=""
                    stepKey={Progression.ALIGNMENT}
                >
                    <h1>Alignment</h1>
                </Step>
                <Step
                    title="Workshop"
                    description=""
                    stepKey={Progression.WORKSHOP}
                >
                    <h1>Workshop</h1>
                </Step>
                <Step
                    title="Follow-up"
                    description=""
                    stepKey={Progression.FOLLOWUP}
                >
                    <h1>Follow-up</h1>
                </Step>
            </Stepper>
        </>
    );
};

export default EvaluationRoute;
