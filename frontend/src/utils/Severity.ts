import { Answer, Severity } from '../api/models'

export interface SeverityCount {
    nOnTrack: number
    nSomeConcerns: number
    nMajorIssues: number
    nNA: number
}

export const countSeverities = (answers: (Answer | null)[]): SeverityCount => {
    return {
        nOnTrack: answers.filter(a => a?.severity === Severity.OnTrack).length,
        nSomeConcerns: answers.filter(a => a?.severity === Severity.SomeConcerns).length,
        nMajorIssues: answers.filter(a => a?.severity === Severity.MajorIssues).length,
        nNA: answers.filter(a => a?.severity === Severity.Na || a === null).length,
    }
}
