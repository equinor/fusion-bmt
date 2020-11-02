import * as React from 'react';
import { Stepper, Step } from '@equinor/fusion-components';
import NominationView from '../views/Evaluation/NominationView';

interface CreateEvaluationRouteProps {
    projectID: string
}

const CreateEvaluationRoute = ({projectID}: CreateEvaluationRouteProps) => {
    const [currentStepKey, setCurrentStepKey] = React.useState("nomination");

    return (
        <>
            <div style={{margin: 10}}>
                <h2>Create evaluation</h2>
            </div>
            <Stepper
                forceOrder={true}
                activeStepKey={currentStepKey}
                hideNavButtons={true}
            >
                <Step
                    title="Nomination"
                    description="In progress"
                    stepKey="nomination"
                >
                    <NominationView evaluationTitle="Evaluation Name"/>
                </Step>
                <Step title="Preparation" description="" stepKey="preparation">
                    <>
                        <h1>Preparation</h1>
                    </>
                </Step>
                <Step title="Alignment" description="" stepKey="alignment">
                    <h1>Alignment</h1>
                </Step>
                <Step title="Workshop" description="" stepKey="workshop">
                    <h1>Workshop</h1>
                </Step>
                <Step title="Follow-up" description="" stepKey="follow_up">
                    <h1>Follow-up</h1>
                </Step>
            </Stepper>
        </>
    );
};

export default CreateEvaluationRoute;
