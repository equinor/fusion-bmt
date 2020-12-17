import { Answer, Progression, Question } from '../api/models'

export const checkIfAnswerFilled = (answer: Answer): boolean => {
    return answer.text !== ""
}

export const getFilledUserAnswersForProgression = (questions: Question[], progression: Progression, azureUniqueId: string): Answer[] => {
    const orgAnswers = questions.reduce((acc: Answer[], cur: Question) => {
        return acc.filter((a: Answer) => a.progression == progression).concat(cur.answers)
    }, [] as Answer[])
    const participantAnswers = orgAnswers.filter(a => a.answeredBy?.azureUniqueId === azureUniqueId)
    return participantAnswers.filter(a => checkIfAnswerFilled(a))
}
