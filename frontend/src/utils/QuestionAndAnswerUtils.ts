import { Answer, Progression, Question } from '../api/models'

export const checkIfAnswerFilled = (answer: Answer): boolean => {
    return answer.text !== ''
}

export const getFilledUserAnswersForProgression = (questions: Question[], progression: Progression, azureUniqueId: string): Answer[] => {
    const progressionAnswers = questions.reduce((acc: Answer[], cur: Question) => {
        return acc.concat(cur.answers.filter((a: Answer) => a.progression === progression))
    }, [] as Answer[])
    const participantAnswers = progressionAnswers.filter(a => a.answeredBy?.azureUniqueId === azureUniqueId)
    return participantAnswers.filter(a => checkIfAnswerFilled(a))
}
