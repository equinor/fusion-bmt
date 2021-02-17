import React from 'react'
import { Progression, Question } from '../api/models'
import { Divider } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'
import QuestionAndAnswerFormWithApi from './QuestionAndAnswer/QuestionAndAnswerFormWithApi'
import QuestionActionsListWithApi from './Action/QuestionActionsListWithApi'
import AnswerSummaryButton from './AnswerSummaryButton'
import { useParticipant } from '../globals/contexts'

type Props = {
    questions: Question[]
    viewProgression: Progression
    disable: boolean
    displayActions?: boolean
    useOnlyFacilitatorAnswer?: boolean
    onQuestionSummarySelected?: (question: Question, questionNumber: number) => void
}

const QuestionsList = ({
    questions,
    viewProgression,
    disable,
    onQuestionSummarySelected,
    displayActions = false,
    useOnlyFacilitatorAnswer = false,
}: Props) => {
    const { azureUniqueId: currentUserAzureUniqueId } = useParticipant()

    const orderedQuestions = questions.sort((q1, q2) => q1.order - q2.order)

    return (
        <>
            {orderedQuestions.map((question, idx) => {
                const answers = question.answers.filter(a => a.progression === viewProgression)
                const answer = useOnlyFacilitatorAnswer
                    ? answers.find(a => !!a)
                    : answers.find(a => a.answeredBy?.azureUniqueId === currentUserAzureUniqueId)
                return (
                    <div key={question.id}>
                        <Divider />
                        <Box display="flex">
                            <Box flexGrow={1}>
                                <QuestionAndAnswerFormWithApi
                                    questionNumber={idx + 1}
                                    question={question}
                                    answer={answer}
                                    disabled={disable}
                                    viewProgression={viewProgression}
                                />
                                {displayActions && <QuestionActionsListWithApi question={question} />}
                            </Box>
                            {onQuestionSummarySelected !== undefined && (
                                <Box>
                                    <AnswerSummaryButton onClick={() => onQuestionSummarySelected(question, idx + 1)} />
                                </Box>
                            )}
                        </Box>
                    </div>
                )
            })}
        </>
    )
}

export default QuestionsList
