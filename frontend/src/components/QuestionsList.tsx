import React from 'react'
import { Organization, Progression, Question, Severity } from '../api/models'
import QuestionItem from './QuestionItem'
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

const QuestionsList = ({ questions, viewProgression, disable, onQuestionSummarySelected, severityFilter, organizationFilter }: Props) => {
    const { azureUniqueId: currentUserAzureUniqueId } = useParticipant()

    const findCorrectAnswer = (question: Question) => {
        const answers = question.answers.filter(a => a.progression === viewProgression)
        return USE_FACILITATOR_ANSWER ? answers.find(a => !!a) : answers.find(a => a.answeredBy?.azureUniqueId === currentUserAzureUniqueId)
    }

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

    const severityFilteredQuestions =
        severityFilter !== undefined ? questions.filter(q => answerHasSelectedSeverity(q, severityFilter)) : questions

    const organizationFilteredQuestions =
        organizationFilter !== undefined
            ? severityFilteredQuestions.filter(q => questionHasSelectedOrganization(q, organizationFilter))
            : severityFilteredQuestions

    const orderedQuestions = organizationFilteredQuestions.sort((q1, q2) => q1.order - q2.order)

    return (
        <div>
            {orderedQuestions.map(question => {
                return (
                    <QuestionItem
                        question={question}
                        useFacilitatorAnswer={USE_FACILITATOR_ANSWER}
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
