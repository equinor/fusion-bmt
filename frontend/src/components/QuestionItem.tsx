import React from 'react'
import { Divider } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'
import QuestionAndAnswerFormWithApi from './QuestionAndAnswer/QuestionAndAnswerFormWithApi'
import QuestionActionsListWithApi from './Action/QuestionActionsListWithApi'
import AnswerSummaryButton from './AnswerSummaryButton'
import { Organization, Progression, Question, Severity } from '../api/models'
import { useParticipant } from '../globals/contexts'

interface Props {
    question: Question
    viewProgression: Progression
    disable: boolean
    useFacilitatorAnswer: boolean
    displayActions?: boolean
    onQuestionSummarySelected?: (question: Question, questionNumber: number) => void
}

const QuestionItem = ({
    question,
    viewProgression,
    disable,
    displayActions = false,
    onQuestionSummarySelected,
    useFacilitatorAnswer,
}: Props) => {
    const { azureUniqueId: currentUserAzureUniqueId } = useParticipant()
    const answers = question.answers.filter(a => a.progression === viewProgression)
    const answer = useFacilitatorAnswer
        ? answers.find(a => !!a)
        : answers.find(a => a.answeredBy?.azureUniqueId === currentUserAzureUniqueId)

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
