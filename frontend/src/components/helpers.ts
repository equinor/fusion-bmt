import { Question, Progression, Role } from '../api/models'

export const findCorrectAnswer = (question: Question, viewProgression: Progression, useFacilitatorAnswer: boolean, userId: string) => {
    const answers = question.answers.filter(a => a.progression === viewProgression)

    if (useFacilitatorAnswer) {
        return answers.find(a => a.answeredBy?.role === Role.Facilitator)
    }
    else
    {
        return answers.find(a => a.answeredBy?.azureUniqueId === userId)
    }
}


export const useSharedFacilitatorAnswer = (progression: Progression) => {
    const correctProgression = !!(
        progression == Progression.Workshop ||
        progression == Progression.FollowUp
    )

    return correctProgression
}
