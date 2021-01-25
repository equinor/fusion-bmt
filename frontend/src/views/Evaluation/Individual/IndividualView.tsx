import React from 'react'

import { Box } from '@material-ui/core'
import { Button, Divider, Typography } from '@equinor/eds-core-react'

import { Barrier, Evaluation, Progression, Role } from '../../../api/models'
import EvaluationSidebar from '../EvaluationSidebar'
import { barrierToString, progressionToString } from '../../../utils/EnumToString'
import ProgressionCompleteSwitch from '../../../components/ProgressionCompleteSwitch'
import QuestionAndAnswerFormWithApi from '../../../components/QuestionAndAnswer/QuestionAndAnswerFormWithApi'
import { getNextProgression, progressionGreaterThanOrEqual, progressionLessThan } from '../../../utils/ProgressionStatus'
import { useParticipant } from '../../../globals/contexts'

interface IndividualViewProps {
    evaluation: Evaluation
    onNextStepClick: () => void
    onProgressParticipant: (newProgressions: Progression) => void
}

const IndividualView = ({ evaluation, onNextStepClick, onProgressParticipant }: IndividualViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)
    const headerRef = React.useRef<HTMLElement>(null)

    const questions = evaluation.questions

    const { role: participantRole, progression: participantProgression, azureUniqueId: participantUniqueId } = useParticipant()

    const viewProgression = Progression.Individual
    const allowedRoles = Object.values(Role)

    const isEvaluationAtThisProgression = evaluation.progression == viewProgression
    const participantAllowed = allowedRoles.includes(participantRole)
    const isParticipantCompleted = progressionLessThan(viewProgression, participantProgression)
    const isEvaluationFinishedHere = progressionLessThan(viewProgression, evaluation.progression)
    const hasParticipantBeenHere = progressionGreaterThanOrEqual(participantProgression, viewProgression)

    const disableAllUserInput = isEvaluationFinishedHere || !participantAllowed || !hasParticipantBeenHere

    const localOnClompleteClick = () => {
        const nextProgression = getNextProgression(participantProgression)
        onProgressParticipant(nextProgression)
    }

    const localOnUncompleteClick = () => {
        onProgressParticipant(viewProgression)
    }

    const onBarrierSelected = (barrier: Barrier) => {
        setSelectedBarrier(barrier)

        if (headerRef !== null && headerRef.current) {
            headerRef.current.scrollIntoView()
        }
    }

    return (
        <>
            <Box display="flex" height={1}>
                <Box>
                    <EvaluationSidebar
                        questions={questions}
                        barrier={selectedBarrier}
                        viewProgression={Progression.Individual}
                        onBarrierSelected={onBarrierSelected}
                    />
                </Box>
                <Box p="20px" width="1">
                    <Box display="flex" flexDirection="row">
                        <Box flexGrow={1}>
                            <Typography variant="h2" ref={headerRef}>
                                {barrierToString(selectedBarrier)}
                            </Typography></Box>
                        <Box mr={2}>
                            <ProgressionCompleteSwitch
                                isCheckedInitially={isParticipantCompleted}
                                disabled={disableAllUserInput}
                                onCompleteClick={localOnClompleteClick}
                                onUncompleteClick={localOnUncompleteClick}
                            />
                        </Box>
                        <Box>
                            <Button
                                onClick={onNextStepClick}
                                disabled={participantRole !== Role.Facilitator || !isEvaluationAtThisProgression}
                            >
                                Finish {progressionToString(viewProgression)}
                            </Button>
                        </Box>
                    </Box>
                    {questions
                        .filter(q => q.barrier === selectedBarrier)
                        .map((question, idx) => {
                            const answer = question.answers
                                .filter(a => a.progression === viewProgression)
                                .find(a => a.answeredBy?.azureUniqueId === participantUniqueId)
                            return (
                                <div key={question.id}>
                                    <Divider />
                                    <QuestionAndAnswerFormWithApi
                                        questionNumber={idx + 1}
                                        question={question}
                                        answer={answer}
                                        disabled={disableAllUserInput || isParticipantCompleted}
                                        viewProgression={viewProgression}
                                    />
                                </div>
                            )
                        })}
                </Box>
            </Box>
        </>
    )
}

export default IndividualView
