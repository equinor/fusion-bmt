
import * as React from 'react'

import { Typography, Divider, Button } from '@equinor/eds-core-react'

import { Barrier, Question, Progression, Role } from "../api/models"
import { barrierToString } from '../utils/EnumToString'
import QuestionAndAnswerFormWithApi from './QuestionAndAnswer/QuestionAndAnswerFormWithApi'
import { getAzureUniqueId } from '../utils/Variables'
import { CurrentParticipantContext } from '../views/Evaluation/EvaluationRoute'
import { Box } from '@material-ui/core'

interface BarrierQuestionsViewProps
{
    barrier: Barrier
    questions: Question[]
    currentProgression: Progression
    onNextStepClick: () => void
    showAnswerSummaryButton: boolean
}

const BarrierQuestionsView = ({barrier, questions, currentProgression, onNextStepClick, showAnswerSummaryButton}: BarrierQuestionsViewProps) => {
    const azureUniqueId = getAzureUniqueId()
    const barrierQuestions = questions.filter(q => q.barrier === barrier)

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
                            || currentProgression !== Progression.Preparation
                        }
                    >
                        Finish Preparation
                    </Button>
                </Box>
            </Box>
            {barrierQuestions.map((question, idx) => {
                const answer = question.answers.find(a => a.answeredBy?.azureUniqueId === azureUniqueId)
                return (
                    <div key={question.id}>
                        <Divider />
                        <QuestionAndAnswerFormWithApi
                            questionNumber={idx + 1}
                            question={question}
                            answer={answer}
                            disabled={currentProgression !== Progression.Preparation}
                            showAnswerSummaryButton={ showAnswerSummaryButton }
                        />
                    </div>
                )
            })}
            <br/>
        </>
    )
}

export default BarrierQuestionsView
