import { Progression } from '../api/models'

export enum ProgressionStatus {
    Complete="Complete",
    InProgress="In Progress",
    Awaiting="Awaiting"
}

export const calcProgressionStatus = (currentProgression: Progression, progressionToEvaluate: Progression): ProgressionStatus => {
    const progressionValues = Object.values(Progression)
    if (progressionValues.indexOf(progressionToEvaluate) > progressionValues.indexOf(currentProgression)) return ProgressionStatus.Awaiting
    if (progressionValues.indexOf(progressionToEvaluate) < progressionValues.indexOf(currentProgression)) return ProgressionStatus.Complete
    return ProgressionStatus.InProgress
}
