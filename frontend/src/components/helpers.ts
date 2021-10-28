import { Context } from '@equinor/fusion'
import { Question, Progression, Role, Severity, Participant } from '../api/models'
import { SeverityCount } from '../utils/Severity'

export const findCorrectAnswer = (question: Question, viewProgression: Progression, useFacilitatorAnswer: boolean, participant: Participant | undefined) => {
    const answers = question.answers.filter(a => a.progression === viewProgression)

    if (useFacilitatorAnswer) {
        return answers.find(a => a.answeredBy?.role === Role.Facilitator)
    } else {
        if (!participant) {
            return undefined
        }
        return answers.find(a => a.answeredBy?.azureUniqueId === participant.azureUniqueId)
    }
}

export const useSharedFacilitatorAnswer = (progression: Progression) => {
    const correctProgression = !!(progression == Progression.Workshop || progression == Progression.FollowUp)

    return correctProgression
}

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

export const getFusionProjectName = (projects: Context[] | undefined, fusionProjectId: string) => {
    const fusionProject = projects?.find(project => project.id === fusionProjectId)
    return fusionProject?.title
}
