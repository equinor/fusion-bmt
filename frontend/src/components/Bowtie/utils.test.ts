import { Severity } from '../../api/models'
import { selectSeverity } from './utils'

describe('selectSeverity', () => {
    test('n/a answers are not counted when calculating percentage of answers per severity', () => {
        expect(selectSeverity(severityCountWithManyNA)).toBe(Severity.MajorIssues)
    })

    test('to show a severity it must have more than, not exactly 10 percent', () => {
        expect(selectSeverity(severityCountLow10percent)).toBe(Severity.SomeConcerns)
        expect(selectSeverity(severityCountLowOver10percent)).toBe(Severity.MajorIssues)
    })

    test('return the strictest severity that has over 10 percent, in this order: MajorIssues - SomeConcerns - OnTrack', () => {
        expect(selectSeverity(severityCountAllOver10Percent)).toBe(Severity.MajorIssues)
        expect(selectSeverity(severityCountMostOver10Percent)).toBe(Severity.SomeConcerns)
    })

    test('returns na if all answers are n/a', () => {
        expect(selectSeverity(severityCountWithOnlyNA)).toBe(Severity.Na)
    })
})

const severityCountWithManyNA = {
    nOnTrack: 0,
    nSomeConcerns: 0,
    nMajorIssues: 2,
    nNA: 30,
}

const severityCountWithOnlyNA = {
    nOnTrack: 0,
    nSomeConcerns: 0,
    nMajorIssues: 0,
    nNA: 30,
}

const severityCountLow10percent = {
    nOnTrack: 0,
    nSomeConcerns: 9,
    nMajorIssues: 1,
    nNA: 0,
}

const severityCountLowOver10percent = {
    nOnTrack: 0,
    nSomeConcerns: 8,
    nMajorIssues: 2,
    nNA: 0,
}

const severityCountAllOver10Percent = {
    nOnTrack: 3,
    nSomeConcerns: 4,
    nMajorIssues: 3,
    nNA: 0,
}

const severityCountMostOver10Percent = {
    nOnTrack: 5,
    nSomeConcerns: 5,
    nMajorIssues: 1,
    nNA: 0,
}
