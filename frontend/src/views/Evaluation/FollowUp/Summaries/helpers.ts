import { Barrier, Maybe, Progression, Question } from '../../../../api/models'
import { AnswersWithBarrier } from '../../../../utils/Variables'

export const assignAnswerToBarrierQuestions = (questions: Array<Maybe<Question>>, stepProgression: Progression): AnswersWithBarrier[] => {
    return Object.values(Barrier).map(barrier => {
        const answersFromStep = questions
            .filter(q => q.barrier === barrier)
            .map(q => {
                const answers = q.answers.filter(a => a.progression === stepProgression)
                const length = answers.length
                if (length === 0) {
                    return null
                }
                return answers[0]
            })
        return { barrier: barrier, answers: answersFromStep }
    })
}
