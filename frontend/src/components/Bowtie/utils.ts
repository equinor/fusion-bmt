import { SeverityCount } from '../../utils/Severity'
import { Severity } from '../../api/models'

export const selectSeverity = (severityCount: SeverityCount) => {
    const PERCENTAGE_OF_ANSWERS_NEEDED_TO_INCREASE_SEVERITY = 10

    const totalSeverityCount = severityCount.nMajorIssues + severityCount.nSomeConcerns + severityCount.nOnTrack
    const percentageMajorIssues = totalSeverityCount > 0 ? (severityCount.nMajorIssues / totalSeverityCount) * 100 : 0
    const percentageSomeConcerns = totalSeverityCount > 0 ? (severityCount.nSomeConcerns / totalSeverityCount) * 100 : 0
    const percentageOnTrack = totalSeverityCount > 0 ? (severityCount.nOnTrack / totalSeverityCount) * 100 : 0

    const percentageMajorIssuesHighEnough = percentageMajorIssues > PERCENTAGE_OF_ANSWERS_NEEDED_TO_INCREASE_SEVERITY
    const percentageSomeConcernsHighEnough = percentageSomeConcerns > PERCENTAGE_OF_ANSWERS_NEEDED_TO_INCREASE_SEVERITY
    const percentageOnTrackHighEnough = percentageOnTrack > PERCENTAGE_OF_ANSWERS_NEEDED_TO_INCREASE_SEVERITY

    if (percentageMajorIssuesHighEnough) return Severity.MajorIssues
    if (!percentageMajorIssuesHighEnough && percentageSomeConcernsHighEnough) return Severity.SomeConcerns
    if (!percentageMajorIssuesHighEnough && !percentageSomeConcernsHighEnough && percentageOnTrackHighEnough) return Severity.OnTrack

    return Severity.Na
}
