import React from 'react'
import { Divider } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'
import QuestionAndAnswerFormWithApi from './QuestionAndAnswer/QuestionAndAnswerFormWithApi'
import QuestionActionsListWithApi from './Action/QuestionActionsListWithApi'
import AnswerSummaryButton from './AnswerSummaryButton'
import { Progression, Question } from '../api/models'
import { useParticipant } from '../globals/contexts'
import { useSharedFacilitatorAnswer, findCorrectAnswer } from './helpers'

interface Props {
    question: Question
    viewProgression: Progression
    disable: boolean
    displayActions?: boolean
    onQuestionSummarySelected?: (question: Question, questionNumber: number) => void
}


const QuestionItem = ({ question, viewProgression, disable, displayActions = false, onQuestionSummarySelected }: Props) => {
    const { azureUniqueId } = useParticipant()

    const useSharedAnswer = useSharedFacilitatorAnswer(viewProgression)
    const answer = findCorrectAnswer(
        question,
        viewProgression,
        useSharedAnswer,
        azureUniqueId
    )

    return (
        <div key={question.id} id={`question-${question.order}`}>
            <Divider />
            <Box display="flex">
                <Box flexGrow={1}>
                    <QuestionAndAnswerFormWithApi
                        question={question}
                        answer={answer}
                        disabled={disable}
                        viewProgression={viewProgression}
                    />
                    {displayActions && <QuestionActionsListWithApi question={question} />}
                </Box>
                {onQuestionSummarySelected !== undefined && (
                    <Box>
                        <AnswerSummaryButton onClick={() => onQuestionSummarySelected(question, question.order)} />
                    </Box>
                )}
            </Box>
        </div>
    )
}

export default QuestionItem
