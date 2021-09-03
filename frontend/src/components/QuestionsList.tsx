import { Organization, Progression, Question, Severity } from '../api/models'
import QuestionItem from './QuestionItem'
import { useParticipant } from '../globals/contexts'
import {
    hasSeverity,
    hasOrganization
} from '../utils/QuestionAndAnswerUtils'

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
    const participant = useParticipant()

    const severityFilteredQuestions = severityFilter !== undefined
        ? questions.filter(q =>
            hasSeverity(
                q,
                severityFilter,
                participant,
                viewProgression
            )
        )
        : questions

    const organizationFilteredQuestions = organizationFilter !== undefined
        ? severityFilteredQuestions.filter(q =>
            hasOrganization(q, organizationFilter)
        )
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
