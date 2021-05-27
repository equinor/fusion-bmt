import { Question, Progression } from '../api/models'

export const findCorrectAnswer = (question: Question, viewProgression: Progression, useFacilitatorAnswer: boolean, userId: string) => {
    const answers = question.answers.filter(a => a.progression === viewProgression)
    return useFacilitatorAnswer ? answers.find(a => !!a) : answers.find(a => a.answeredBy?.azureUniqueId === userId)
}
