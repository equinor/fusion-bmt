import { Answer, Organization, Participant, Progression, Question, QuestionTemplate, Severity } from '../api/models'
import { findCorrectAnswer, useSharedFacilitatorAnswer } from '../components/helpers'

export const checkIfAnswerFilled = (answer: Answer): boolean => {
    return answer.text !== ''
}

export const getFilledUserAnswersForProgression = (questions: Question[], progression: Progression, azureUniqueId: string): Answer[] => {
    const progressionAnswers = questions.reduce((acc: Answer[], cur: Question) => {
        return acc.concat(cur.answers.filter((a: Answer) => a.progression === progression))
    }, [] as Answer[])
    const participantAnswers =
        progression === Progression.Workshop
            ? progressionAnswers
            : progressionAnswers.filter(a => a.answeredBy?.azureUniqueId === azureUniqueId)
    return participantAnswers.filter(a => checkIfAnswerFilled(a))
}

export const hasSeverity = (question: Question, severityFilter: Severity[], participant: Participant | undefined, viewProgression: Progression) => {
    if (severityFilter.length === 0) {
        return true
    } else {
        const useSharedAnswer = useSharedFacilitatorAnswer(viewProgression)
        const answer = findCorrectAnswer(question, viewProgression, useSharedAnswer, participant)
        const severity = (answer && answer.severity) || Severity.Na
        return severityFilter.includes(severity)
    }
}

export const hasOrganization = (question: Question | QuestionTemplate, organizationFilter: Organization[]) => {
    if (organizationFilter.length === 0) {
        return true
    } else {
        return organizationFilter.includes(question.organization)
    }
}

export const toggleFilter = <T>(value: T, filter: T[]) => {
    if (filter.includes(value)) {
        return filter.filter(x => x !== value)
    } else {
        return [...filter, value]
    }
}
