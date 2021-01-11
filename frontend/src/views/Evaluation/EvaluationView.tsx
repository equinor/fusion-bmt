import { Step, Stepper } from '@equinor/fusion-components'
import React from 'react'
import { Evaluation, Progression, Role } from '../../api/models'
import { calcProgressionStatus } from '../../utils/ProgressionStatus'
import NominationView from './Nomination/NominationView'
import IndividualAssessmentView from './IndividualAssessment/IndividualAssessmentView'
import AlignmentView from './Alignment/AlignmentView'
import WorkshopView from './Workshop/WorkshopView'
import QuestionnaireStatusTabs from '../../components/StatusTab'
import FollowUpView from './FollowUp/FollowUpView'

interface EvaluationViewProps {
    evaluation: Evaluation
    onProgressEvaluationClick: () => void
    onProgressParticipant: (newProgressions: Progression) => void
}

const EvaluationView = ({evaluation, onProgressEvaluationClick, onProgressParticipant}: EvaluationViewProps) => {
    const allowedRoles = Object.values(Role)
    return <>
        <Stepper
            forceOrder={false}
            activeStepKey={evaluation.progression}
            hideNavButtons={true}
        >
            <Step
                title="Nomination"
                description={calcProgressionStatus(evaluation.progression, Progression.Nomination)}
                stepKey={Progression.Nomination}
            >
                <NominationView
                    evaluation={evaluation}
                    onNextStep={() => onProgressEvaluationClick()}
                />
            </Step>
            <Step
                title="Individual Assessment"
                description={calcProgressionStatus(evaluation.progression, Progression.IndividualAssessment)}
                stepKey={Progression.IndividualAssessment}
            >
                <QuestionnaireStatusTabs evaluation={evaluation} viewProgression={Progression.IndividualAssessment} allowedRoles={allowedRoles}>
                    <IndividualAssessmentView
                        evaluation={evaluation}
                        onNextStepClick={() => onProgressEvaluationClick()}
                        onProgressParticipant={onProgressParticipant}
                    />
                </QuestionnaireStatusTabs>
            </Step>
            <Step
                title="Alignment"
                description={calcProgressionStatus(evaluation.progression, Progression.Alignment)}
                stepKey={Progression.Alignment}
            >
                <QuestionnaireStatusTabs evaluation={evaluation} viewProgression={Progression.Alignment} allowedRoles={[Role.OrganizationLead]}>
                    <AlignmentView
                        evaluation={evaluation}
                        onNextStepClick={() => onProgressEvaluationClick()}
                        onProgressParticipant={onProgressParticipant}
                    />
                </QuestionnaireStatusTabs>
            </Step>
            <Step
                title="Workshop"
                description={calcProgressionStatus(evaluation.progression, Progression.Workshop)}
                stepKey={Progression.Workshop}
            >
                <div>
                    {/* Div added to make position: sticky work for deeper components */}
                    <WorkshopView
                        evaluation={evaluation}
                        onNextStepClick={() => onProgressEvaluationClick()}
                        onProgressParticipant={onProgressParticipant}
                    />
                </div>
            </Step>
            <Step
                title="Follow-up"
                description={calcProgressionStatus(evaluation.progression, Progression.FollowUp)}
                stepKey={Progression.FollowUp}
            >
                <div>
                    {/* Div added to make position: sticky work for deeper components */}
                    <FollowUpView
                        evaluation={evaluation}
                    />
                </div>
            </Step>
        </Stepper>
    </>
}

export default EvaluationView
