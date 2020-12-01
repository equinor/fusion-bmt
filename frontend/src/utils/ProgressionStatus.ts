import { Progression } from '../api/models'

export enum ProgressionStatus {
    Complete="Complete",
    InProgress="In Progress",
    Awaiting="Awaiting"
}

export const calcProgressionStatus = (currentProgression: Progression, progressionToEvaluate: Progression): ProgressionStatus => {
    if (progressionLessThan(currentProgression, progressionToEvaluate)) return ProgressionStatus.Awaiting
    if (progressionLessThan(progressionToEvaluate, currentProgression)) return ProgressionStatus.Complete
    return ProgressionStatus.InProgress
}

export const progressionLessThan = (p1: Progression, p2: Progression): boolean => {
    const progressionValues = Object.values(Progression)
    const p1i = progressionValues.indexOf(p1)
    const p2i = progressionValues.indexOf(p2)
    return p1i < p2i
}

export const getNextProgression = (progression: Progression): Progression => {
    switch(progression){
    case Progression.Nomination: return Progression.Preparation
    case Progression.Preparation: return Progression.Alignment
    case Progression.Alignment: return Progression.Workshop
    case Progression.Workshop: return Progression.FollowUp
    case Progression.FollowUp: return Progression.FollowUp
    }
}

export const getLastProgression = (progression: Progression): Progression => {
    switch(progression){
    case Progression.Nomination: return Progression.Nomination
    case Progression.Preparation: return Progression.Nomination
    case Progression.Alignment: return Progression.Preparation
    case Progression.Workshop: return Progression.Alignment
    case Progression.FollowUp: return Progression.Workshop
    }
}
