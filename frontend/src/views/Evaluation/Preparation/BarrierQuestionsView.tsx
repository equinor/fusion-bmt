
import * as React from 'react'

import { Typography, Divider } from '@equinor/eds-core-react'

import { Barrier, Progression, Question, Role } from "../../../api/models"
import QuestionAndAnswerFormWithApi from '../../../components/QuestionAndAnswer/QuestionAndAnswerFormWithApi'
import { barrierToString } from '../../../utils/EnumToString'
import { getAzureUniqueId } from '../../../utils/Variables'
import { Box } from '@material-ui/core'
import { Button } from '@equinor/fusion-components'
import { useContext } from 'react'
import { CurrentParticipantContext } from '../EvaluationRoute'

interface BarrierQuestionsViewProps
{
    barrier: Barrier
    questions: Question[]
    currentProgression: Progression
    onNextStepClick: () => void
}

const BarrierQuestionsView = ({barrier, questions, currentProgression, onNextStepClick}: BarrierQuestionsViewProps) => {
    const azureUniqueId = getAzureUniqueId()
    const barrierQuestions = questions.filter(q => q.barrier === barrier)

    const currentParticipant = useContext(CurrentParticipantContext)

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
                        />
                    </div>
                )
            })}
            <br/>
        </>
    )
}

export default BarrierQuestionsView
