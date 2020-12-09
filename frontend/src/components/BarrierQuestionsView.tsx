
import React, { useContext } from 'react'

import { Typography, Divider, Button } from '@equinor/eds-core-react'

import { Barrier, Participant, Question, Progression, Role } from "../api/models"
import { barrierToString, progressionToString } from '../utils/EnumToString'
import QuestionAndAnswerFormWithApi from './QuestionAndAnswer/QuestionAndAnswerFormWithApi'
import { getAzureUniqueId } from '../utils/Variables'
import { CurrentParticipantContext } from '../views/Evaluation/EvaluationRoute'
import { Box } from '@material-ui/core'
import ProgressionCompleteSwitch from './ProgressionCompleteSwitch'
import { getLastProgression, getNextProgression, progressionLessThan } from '../utils/ProgressionStatus'

const useParticipant = (): Participant => {
    const participant = useContext(CurrentParticipantContext)
    if(participant === undefined){
        throw new Error(`No participant provided for context`)
    }
    return participant
}

interface BarrierQuestionsViewProps
{
    barrier: Barrier
    questions: Question[]
    currentProgression: Progression
    viewProgression: Progression
    allowedRoles: Role[]
    onNextStepClick: () => void
    onCompleteSwitchClick: (newProgression: Progression) => void
    onQuestionSummarySelected?: (question: Question, questionNumber: number) => void
}

const BarrierQuestionsView = ({
    barrier,
    questions,
    currentProgression,
    viewProgression,
    allowedRoles,
    onNextStepClick,
    onCompleteSwitchClick,
    onQuestionSummarySelected
}: BarrierQuestionsViewProps) => {
    const azureUniqueId = getAzureUniqueId()
    const barrierQuestions = questions.filter(q => q.barrier === barrier)

    const {role: participantRole, progression: participantProgression} = useParticipant()

    const isEvaluationAtThisProgression = currentProgression == viewProgression
    const isParticipantCompleted= progressionLessThan(viewProgression, participantProgression)
    const isEvaluationFinishedHere = progressionLessThan(viewProgression, currentProgression)
    const hasParticipantBeenHere = !progressionLessThan(participantProgression, viewProgression)

    const isQuestionAndAnswerDisabled = isEvaluationFinishedHere
                                        || isParticipantCompleted
                                        || !allowedRoles.includes(participantRole)

    const localOnClompleteClick = () => {
        const nextProgression = getNextProgression(participantProgression)
        onCompleteSwitchClick(nextProgression)
    }

    const localOnUnCompleteClick = () => {
        const lastProgression = getLastProgression(participantProgression)
        onCompleteSwitchClick(lastProgression)
    }

    return (
        <>
            <Box display="flex" flexDirection="row">
                <Box flexGrow={1}>
                    <Typography variant="h2">{barrierToString(barrier)}</Typography>
                </Box>
                <Box mr={2}>
                    <ProgressionCompleteSwitch
                        isCheckedInitially={isParticipantCompleted}
                        disabled={isEvaluationFinishedHere || !hasParticipantBeenHere}
                        onCompleteClick={localOnClompleteClick}
                        onUnCompleteClick={localOnUnCompleteClick}
                    />
                </Box>
                <Box>
                    <Button
                        onClick={onNextStepClick}
                        disabled={
                            participantRole !== Role.Facilitator
                            || !isEvaluationAtThisProgression
                        }
                    >
                        Finish { progressionToString(viewProgression) }
                    </Button>
                </Box>
            </Box>
            {barrierQuestions.map((question, idx) => {
                const answer = question.answers
                    .filter(a => a.progression === viewProgression)
                    .find(a => a.answeredBy?.azureUniqueId === azureUniqueId)
                return (
                    <div key={question.id}>
                        <Divider />
                        <QuestionAndAnswerFormWithApi
                            questionNumber={idx+1}
                            question={question}
                            answer={answer}
                            disabled={isQuestionAndAnswerDisabled}
                            onQuestionSummarySelected={ onQuestionSummarySelected }
                            viewProgression={viewProgression}
                        />
                    </div>
                )
            })}
            <br/>
        </>
    )
}

export default BarrierQuestionsView
