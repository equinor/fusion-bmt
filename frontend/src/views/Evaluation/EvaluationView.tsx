import { Step, Stepper } from '@equinor/fusion-components'
import React from 'react'
import { Evaluation, Progression, Role } from '../../api/models'
import { calcProgressionStatus } from '../../utils/ProgressionStatus'
import NominationView from './Nomination/NominationView'
import IndividualView from './Individual/IndividualView'
import PreparationView from './Preparation/PreparationView'
import WorkshopView from './Workshop/WorkshopView'
import QuestionnaireStatusTabs from '../../components/StatusTab'
import { progressionToString } from '../../utils/EnumToString'
import FollowUpStepView from './FollowUp/FollowUpStepView'
import WorkshopTabs from './Workshop/WorkshopTabs'

interface EvaluationViewProps {
    evaluation: Evaluation
    onProgressEvaluationClick: () => void
    onProgressParticipant: (newProgressions: Progression) => void
}

const EvaluationView = ({ evaluation, onProgressEvaluationClick, onProgressParticipant }: EvaluationViewProps) => {
    const allRoles = Object.values(Role)

    return (
        <>
            <Stepper forceOrder={false} activeStepKey={evaluation.progression} hideNavButtons={true}>
                <Step
                    title={progressionToString(Progression.Nomination)}
                    description={calcProgressionStatus(evaluation.progression, Progression.Nomination)}
                    stepKey={Progression.Nomination}
                >
                    <NominationView evaluation={evaluation} onNextStep={() => onProgressEvaluationClick()} />
                </Step>
                <Step
                    title={progressionToString(Progression.Individual)}
                    description={calcProgressionStatus(evaluation.progression, Progression.Individual)}
                    stepKey={Progression.Individual}
                >
                    <QuestionnaireStatusTabs evaluation={evaluation} viewProgression={Progression.Individual} allowedRoles={allRoles}>
                        <IndividualView
                            evaluation={evaluation}
                            onNextStepClick={() => onProgressEvaluationClick()}
                            onProgressParticipant={onProgressParticipant}
                        />
                    </QuestionnaireStatusTabs>
                </Step>
                <Step
                    title={progressionToString(Progression.Preparation)}
                    description={calcProgressionStatus(evaluation.progression, Progression.Preparation)}
                    stepKey={Progression.Preparation}
                >
                    <QuestionnaireStatusTabs
                        evaluation={evaluation}
                        viewProgression={Progression.Preparation}
                        allowedRoles={[Role.OrganizationLead, Role.Facilitator]}
                    >
                        <PreparationView
                            evaluation={evaluation}
                            onNextStepClick={() => onProgressEvaluationClick()}
                            onProgressParticipant={onProgressParticipant}
                        />
                    </QuestionnaireStatusTabs>
                </Step>
                <Step
                    title={progressionToString(Progression.Workshop)}
                    description={calcProgressionStatus(evaluation.progression, Progression.Workshop)}
                    stepKey={Progression.Workshop}
                >
                    <WorkshopTabs
                        evaluation={evaluation}
                    >
                        <WorkshopView
                            evaluation={evaluation}
                            onNextStepClick={() => onProgressEvaluationClick()}
                            onProgressParticipant={onProgressParticipant}
                        />
                    </WorkshopTabs>
                </Step>
                <Step
                    title={progressionToString(Progression.FollowUp)}
                    description={calcProgressionStatus(evaluation.progression, Progression.FollowUp)}
                    stepKey={Progression.FollowUp}
                >
                    <FollowUpStepView evaluation={evaluation} />
                </Step>
            </Stepper>
        </>
    )
}

export default EvaluationView
