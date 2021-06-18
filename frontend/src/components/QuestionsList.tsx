import React from 'react'
import { Organization, Progression, Question, Severity } from '../api/models'
import QuestionItem from './QuestionItem'
import { useParticipant } from '../globals/contexts'
import { useSharedFacilitatorAnswer, findCorrectAnswer } from './helpers'

type Props = {
    questions: Question[]
    viewProgression: Progression
    disable: boolean
    displayActions?: boolean
    onQuestionSummarySelected?: (question: Question) => void
    severityFilter?: Severity[]
    organizationFilter?: Organization[]
}

const QuestionsList = ({ questions, viewProgression, disable, displayActions, onQuestionSummarySelected, severityFilter, organizationFilter }: Props) => {
    const { azureUniqueId: currentUserAzureUniqueId } = useParticipant()

    const answerHasSelectedSeverity = (question: Question, severityFilter: Severity[]) => {
        if (severityFilter.length === 0) {
            return true
        } else {
            const useSharedAnswer = useSharedFacilitatorAnswer(viewProgression)
            const answer = findCorrectAnswer(
                question,
                viewProgression,
                useSharedAnswer,
                currentUserAzureUniqueId
            )
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

    const severityFilteredQuestions =
        severityFilter !== undefined ? questions.filter(q => answerHasSelectedSeverity(q, severityFilter)) : questions

    const organizationFilteredQuestions =
        organizationFilter !== undefined
            ? severityFilteredQuestions.filter(q => questionHasSelectedOrganization(q, organizationFilter))
            : severityFilteredQuestions

    const orderedQuestions = organizationFilteredQuestions.sort((q1, q2) => q1.order - q2.order)

    return (
        <div>
            {orderedQuestions.map((question, index) => {
                return (
                    <QuestionItem
                        key={index}
                        displayActions={displayActions}
                        question={question}
                        viewProgression={viewProgression}
                        disable={disable}
                        onQuestionSummarySelected={onQuestionSummarySelected}
                    />
                )
            })}
        </div>
    )
}

export default QuestionsList
