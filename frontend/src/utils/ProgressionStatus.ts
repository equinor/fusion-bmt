import { Progression } from '../api/models'

export enum ProgressionStatus {
    Complete = 'Complete',
    InProgress = 'In Progress',
    Awaiting = 'Awaiting',
}

export const countProgressionStatus = (progressionStatusToCount: ProgressionStatus, currentProgression: Progression) => {
    let count = 0
    {
        Object.values(Progression).map(progression => {
            const progressionStatus = calcProgressionStatus(currentProgression, progression)
            if (progressionStatus === progressionStatusToCount) {
                count++
            }
        })
    }
    return count
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

export const progressionGreaterThan = (p1: Progression, p2: Progression): boolean => {
    if (p1 === p2) return false
    return !progressionLessThan(p1, p2)
}

export const progressionGreaterThanOrEqual = (p1: Progression, p2: Progression): boolean => {
    if (p1 === p2) return true
    return progressionGreaterThan(p1, p2)
}

export const getNextProgression = (progression: Progression): Progression => {
    switch (progression) {
        case Progression.Nomination:
            return Progression.Individual
        case Progression.Individual:
            return Progression.Preparation
        case Progression.Preparation:
            return Progression.Workshop
        case Progression.Workshop:
            return Progression.FollowUp
        case Progression.FollowUp:
            return Progression.Finished
        case Progression.Finished:
            return Progression.Finished
    }
}

export const getLastProgression = (progression: Progression): Progression => {
    switch (progression) {
        case Progression.Nomination:
            return Progression.Nomination
        case Progression.Individual:
            return Progression.Nomination
        case Progression.Preparation:
            return Progression.Individual
        case Progression.Workshop:
            return Progression.Preparation
        case Progression.FollowUp:
            return Progression.Workshop
        case Progression.Finished:
            return Progression.FollowUp
    }
}
