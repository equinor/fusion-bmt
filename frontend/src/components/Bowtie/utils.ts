import { SeverityCount } from '../../utils/Severity'
import { Severity } from '../../api/models'

export const selectSeverity = (severityCount: SeverityCount) => {
    const PERCENTAGE_OF_ANSWERS_NEEDED_TO_INCREASE_SEVERITY = 10

    const totalSeverityCount = severityCount.nLow + severityCount.nLimited + severityCount.nHigh
    const percentageLowSeverity = totalSeverityCount > 0 ? (severityCount.nLow / totalSeverityCount) * 100 : 0
    const percentageLimitedSeverity = totalSeverityCount > 0 ? (severityCount.nLimited / totalSeverityCount) * 100 : 0
    const percentageHighSeverity = totalSeverityCount > 0 ? (severityCount.nHigh / totalSeverityCount) * 100 : 0

    const lowSeverityHighEnough = percentageLowSeverity > PERCENTAGE_OF_ANSWERS_NEEDED_TO_INCREASE_SEVERITY
    const limitedSeverityHighEnough = percentageLimitedSeverity > PERCENTAGE_OF_ANSWERS_NEEDED_TO_INCREASE_SEVERITY
    const highSeverityHighEnough = percentageHighSeverity > PERCENTAGE_OF_ANSWERS_NEEDED_TO_INCREASE_SEVERITY

    if (lowSeverityHighEnough) return Severity.Low
    if (!lowSeverityHighEnough && limitedSeverityHighEnough) return Severity.Limited
    if (!lowSeverityHighEnough && !limitedSeverityHighEnough && highSeverityHighEnough) return Severity.High

    return Severity.Na
}
