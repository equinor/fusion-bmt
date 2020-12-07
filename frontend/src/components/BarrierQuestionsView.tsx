
import * as React from 'react'

import { Typography, Divider, Button } from '@equinor/eds-core-react'

import { Barrier, Question, Progression, Role } from "../api/models"
import { barrierToString, progressionToString } from '../utils/EnumToString'
import QuestionAndAnswerFormWithApi from './QuestionAndAnswer/QuestionAndAnswerFormWithApi'
import { getAzureUniqueId } from '../utils/Variables'
import { CurrentParticipantContext } from '../views/Evaluation/EvaluationRoute'
import { Box } from '@material-ui/core'

interface BarrierQuestionsViewProps
{
    barrier: Barrier
    questions: Question[]
    currentProgression: Progression
    viewProgression: Progression
    onNextStepClick: () => void
    onQuestionSummarySelected?: (question: Question, questionNumber: number) => void
}

const BarrierQuestionsView = ({barrier, questions, currentProgression, viewProgression, onNextStepClick, onQuestionSummarySelected}: BarrierQuestionsViewProps) => {
    const barrierQuestions = questions.filter(q => q.barrier === barrier)
    const azureUniqueId = getAzureUniqueId()

    const currentParticipant = React.useContext(CurrentParticipantContext)

    return (
        <>
            <Box display="flex" flexDirection="row">
                <Box flexGrow={1}>
                    <Typography variant="h2">{barrierToString(barrier)}</Typography>
                </Box>
                <Box>
                    <Button
                        onClick={onNextStepClick}
                        disabled={
                            currentParticipant?.role !== Role.Facilitator
                            || currentProgression !== viewProgression
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
                            disabled={currentProgression !== viewProgression}
                            onQuestionSummarySelected={ onQuestionSummarySelected }
                        />
                    </div>
                )
            })}
            <br/>
        </>
    )
}

export default BarrierQuestionsView
