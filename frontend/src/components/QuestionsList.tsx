import React from 'react'
import { Organization, Progression, Question, Severity } from '../api/models'
import { Divider } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'
import QuestionAndAnswerFormWithApi from './QuestionAndAnswer/QuestionAndAnswerFormWithApi'
import QuestionActionsListWithApi from './Action/QuestionActionsListWithApi'
import AnswerSummaryButton from './AnswerSummaryButton'
import { useParticipant } from '../globals/contexts'

const USE_FACILITATOR_ANSWER = true

type Props = {
    questions: Question[]
    viewProgression: Progression
    disable: boolean
    displayActions?: boolean
    onQuestionSummarySelected?: (question: Question) => void
    severityFilter?: Severity[]
    organizationFilter?: Organization[]
}

const QuestionsList = ({
    questions,
    severityFilter,
    organizationFilter,
    viewProgression,
    disable,
    onQuestionSummarySelected,
    displayActions = false,
}: Props) => {
    const { azureUniqueId: currentUserAzureUniqueId } = useParticipant()

    const answerHasSelectedSeverity = (question: Question, severityFilter: Severity[]) => {
        if (severityFilter.length === 0) {
            return true
        } else {
            const answer = findCorrectAnswer(question)
            const severity = (answer && answer.severity) || Severity.Na
            return severityFilter.includes(severity)
        }
    }

    const questionHasSelectedOrganization = (question: Question, organizationFilter: Organization[]) => {
        if (organizationFilter.length === 0) {
            return true
        } else {
            return organizationFilter.includes(question.organization)
        }
    }

    const findCorrectAnswer = (question: Question) => {
        const answers = question.answers.filter(a => a.progression === viewProgression)
        return USE_FACILITATOR_ANSWER ? answers.find(a => !!a) : answers.find(a => a.answeredBy?.azureUniqueId === currentUserAzureUniqueId)
    }

    const severityFilteredQuestions =
        severityFilter !== undefined ? questions.filter(q => answerHasSelectedSeverity(q, severityFilter)) : questions

    const organizationFilteredQuestions =
        organizationFilter !== undefined
            ? severityFilteredQuestions.filter(q => questionHasSelectedOrganization(q, organizationFilter))
            : severityFilteredQuestions
    const orderedQuestions = organizationFilteredQuestions.sort((q1, q2) => q1.order - q2.order)

    return (
        <>
            {orderedQuestions.map(question => {
                const answer = findCorrectAnswer(question)

                return (
                    <div key={question.id}>
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
                                    <AnswerSummaryButton onClick={() => onQuestionSummarySelected(question)} />
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
