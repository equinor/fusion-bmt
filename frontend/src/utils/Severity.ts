import { Answer, Severity } from '../api/models'

export interface SeverityCount {
    nHigh: number
    nLimited: number
    nLow: number
    nNA: number
}

export const countSeverities = (answers: (Answer | null)[]): SeverityCount => {
    return {
        nHigh: answers.filter(a => a?.severity === Severity.High).length,
        nLimited: answers.filter(a => a?.severity === Severity.Limited).length,
        nLow: answers.filter(a => a?.severity === Severity.Low).length,
        nNA: answers.filter(a => a?.severity === Severity.Na || a === null).length,
    }
}
