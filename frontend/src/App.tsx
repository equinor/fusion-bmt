import React, { useState } from 'react';

import { useCurrentContext, useCurrentUser } from '@equinor/fusion';
import GQLButtons from './GraphQL/GQLButtons';
import { Switch, Route } from 'react-router-dom';
import ProjectHomeRoute from './routes/ProjectHomeRoute';
import CreateEvaluationRoute from './routes/CreateEvaluationRoute';
import QuestionAndAnswerForm from './components/Q&A/QuestionAndAnswerForm';
import { Barrier, Question, Organization, Status, Evaluation, Answer, Participant, Progression, Severity } from './api/models';

const App = () => {
    const question: Question = {
        actions: [],
        answers: [],
        barrier: Barrier.GM,
        createDate: new Date(),
        organization: Organization.ENGINEERING,
        id: "qqq",
        evaluationId: "eee",
        status: Status.ACTIVE,
        evaluation: null as unknown as Evaluation,
        text: "Is there a process in place?",
        supportNotes: "Processes and tools < individuals and interactions"
    }

    const initialAnswer: Answer = {
        id: "aaa",
        createDate: new Date(),
        answeredBy: null as unknown as Participant,
        questionId: "qqq",
        progression: Progression.ALIGNMENT,
        severity: Severity.HIGH,
        question: question,
        text: "Start text"
    }
    const [answer, setAnswer] = useState<Answer>(initialAnswer);

    const currentProject = useCurrentContext();

    const currentUser = useCurrentUser();

    if(!currentUser){
        return <p>Please log in.</p>
    }

    if(!currentProject){
        return <>
            <p>Please select a project.</p>
            <GQLButtons />
            <div style={{border: "10px solid black"}}>
                <QuestionAndAnswerForm
                    questionNumber={1}
                    question={question}
                    answer={answer}
                    onAnswerChange={(answer) => {
                        setAnswer(answer);
                    }}
                />
            </div>
        </>
    }

    return <>
        <Switch>
            <Route path="/:projectID" exact render={() => <ProjectHomeRoute projectID={currentProject.id} />} />
            <Route path="/:projectID/createEvaluation" exact render={() => <CreateEvaluationRoute projectID={currentProject.id} />} />
        </Switch>
    </>
}

export default App;
