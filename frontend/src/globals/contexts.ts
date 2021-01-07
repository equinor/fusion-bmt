import { createContext, useContext } from 'react'

import { Evaluation, Participant, Project } from '../api/models'

export const CurrentParticipantContext = createContext<Participant | undefined>(undefined)
export const EvaluationContext = createContext<Evaluation | undefined>(undefined)
export const ProjectContext = createContext<Project | undefined>(undefined)

export const useParticipant = (): Participant => {
    const participant = useContext(CurrentParticipantContext)
    if(participant === undefined){
        throw new Error(`No participant provided for context`)
    }
    return participant
}

export const useEvaluation = (): Evaluation => {
    const evaluation = useContext(EvaluationContext)
    if(evaluation === undefined){
        throw new Error(`No evaluation provided for context`)
    }
    return evaluation
}

export const useProject = (): Project => {
    const project = useContext(ProjectContext)
    if(project === undefined){
        throw new Error(`No project provided for context`)
    }
    return project
}
