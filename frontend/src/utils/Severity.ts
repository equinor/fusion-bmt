import { Answer, Severity } from '../api/models'

export interface SeverityCount {
    nHigh: number
    nLimited: number
    nLow: number
    nNA: number
}

export const countSeverities = (answers: (Answer | null)[]): SeverityCount => {
    return {
        nHigh: answers.filter(a => a?.severity === Severity.OnTrack).length,
        nLimited: answers.filter(a => a?.severity === Severity.SomeConcerns).length,
        nLow: answers.filter(a => a?.severity === Severity.MajorIssues).length,
        nNA: answers.filter(a => a?.severity === Severity.Na || a === null).length,
    }
}
