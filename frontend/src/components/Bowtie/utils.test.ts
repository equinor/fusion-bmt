import { Severity } from '../../api/models'
import { selectSeverity } from './utils'

describe('selectSeverity', () => {
    test('n/a answers are not counted when calculating percentage of answers per severity', () => {
        expect(selectSeverity(severityCountWithManyNA)).toBe(Severity.Low)
    })

    test('to show a severity it must have more than, not exactly 10 percent', () => {
        expect(selectSeverity(severityCountLow10percent)).toBe(Severity.Limited)
        expect(selectSeverity(severityCountLowOver10percent)).toBe(Severity.Low)
    })

    test('return the strictest severity that has over 10 percent, in this order: low - limited - high', () => {
        expect(selectSeverity(severityCountAllOver10Percent)).toBe(Severity.Low)
        expect(selectSeverity(severityCountMostOver10Percent)).toBe(Severity.Limited)
    })

    test('returns na if all answers are n/a', () => {
        expect(selectSeverity(severityCountWithOnlyNA)).toBe(Severity.Na)
    })
})

const severityCountWithManyNA = {
    nHigh: 0,
    nLimited: 0,
    nLow: 2,
    nNA: 30,
}

const severityCountWithOnlyNA = {
    nHigh: 0,
    nLimited: 0,
    nLow: 0,
    nNA: 30,
}

const severityCountLow10percent = {
    nHigh: 0,
    nLimited: 9,
    nLow: 1,
    nNA: 0,
}

const severityCountLowOver10percent = {
    nHigh: 0,
    nLimited: 8,
    nLow: 2,
    nNA: 0,
}

const severityCountAllOver10Percent = {
    nHigh: 3,
    nLimited: 4,
    nLow: 3,
    nNA: 0,
}

const severityCountMostOver10Percent = {
    nHigh: 5,
    nLimited: 5,
    nLow: 1,
    nNA: 0,
}
