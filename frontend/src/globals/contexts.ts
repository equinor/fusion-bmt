import { createContext, useContext } from 'react'

import { Evaluation, Participant } from '../api/models'

export const CurrentParticipantContext = createContext<Participant | undefined>(undefined)
export const EvaluationContext = createContext<Evaluation | undefined>(undefined)

export const useParticipant = (): Participant | undefined => {
    const participant = useContext(CurrentParticipantContext)
    return participant
}

export const useEvaluation = (): Evaluation => {
    const evaluation = useContext(EvaluationContext)
    if (evaluation === undefined) {
        throw new Error(`No evaluation provided for context`)
    }
    return evaluation
}
