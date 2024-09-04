import { Context } from '@equinor/fusion'
import { Question, Progression, Role, Severity, Participant, Evaluation } from '../api/models'
import { UserRolesInEvaluation } from './helperModels'
import { SeverityCount } from './Severity'
import jwtDecode from 'jwt-decode'

interface Token {
    [key: string]: any
}

export const getCachedRoles = (): string[] => {
    const token = window.sessionStorage.getItem('token')
    if (token !== null) {
        const objectFromDecodedToken: Token = jwtDecode(token) as Token
        const roles: string[] = objectFromDecodedToken['roles']
        return roles
    }
    return []
}

export const findCorrectAnswer = (
    question: Question,
    viewProgression: Progression,
    useFacilitatorAnswer: boolean,
    participant: Participant | undefined
) => {
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

export const getFusionProjectName = (projects: Context[] | undefined, fusionProjectId: string) => {
    if (!fusionProjectId || !projects) { return undefined }
    const fusionProject = projects?.find(project => project.id === fusionProjectId)
    return fusionProject?.title
}

export const toCapitalizedCase = (input: string): string => {
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase()
}

export const evaluationCanBeHidden = (evaluation: Evaluation, userRoles: UserRolesInEvaluation[], userIsAdmin: boolean) => {
    const userRole = userRoles.find(role => role.evaluationId === evaluation.id)?.role
    const isFacilitator = userRole === Role.Facilitator
    const evaluationIsNotActive = evaluation.project.indicatorEvaluationId !== evaluation.id

    let reasonsForNotBeingAbleToHide = []

    if (!isFacilitator && !userIsAdmin) {
        reasonsForNotBeingAbleToHide.push("only facilitators and admins can hide evaluations")
    }
    if (!evaluationIsNotActive) {
        reasonsForNotBeingAbleToHide.push("active evaluations cannot be hidden")
    }

    const toolTipMessage = reasonsForNotBeingAbleToHide.length > 0
        ? reasonsForNotBeingAbleToHide.join(" & ")
        : "Hide evaluation"

    const canUserHide = (isFacilitator && evaluationIsNotActive) || (userIsAdmin && evaluationIsNotActive)

    return { "canHide": canUserHide, "toolTipMessage": toolTipMessage }
}

export const canSetEvaluationAsIndicator = (evaluation: Evaluation, userRoles: UserRolesInEvaluation[], userIsAdmin: boolean) => {
    const userRole = userRoles.find(role => role.evaluationId === evaluation.id)?.role
    const isFacilitator = userRole === Role.Facilitator
    const evaluationIsNotActive = evaluation.project.indicatorEvaluationId !== evaluation.id
    const evaluationIsNotInFollowUpOrFinished = evaluation.progression === Progression.FollowUp || evaluation.progression === Progression.Finished

    let reasonsForNotBeingAbleToSelect = []

    if (!isFacilitator && !userIsAdmin) {
        reasonsForNotBeingAbleToSelect.push("only facilitators and admins can set an evaluation as active")
    }
    if (!evaluationIsNotActive) {
        reasonsForNotBeingAbleToSelect.push("this evaluation is already active")
    }
    if (!evaluationIsNotInFollowUpOrFinished) {
        reasonsForNotBeingAbleToSelect.push("this evaluation is not in follow-up or finished stage")
    }

    const toolTipMessage = reasonsForNotBeingAbleToSelect.length > 0
        ? reasonsForNotBeingAbleToSelect.join(" & ")
        : "Set as active evaluation"

    const canUserSetAsIndicator = (isFacilitator || userIsAdmin) && evaluationIsNotInFollowUpOrFinished && evaluationIsNotActive

    return { "canSetAsIndicator": canUserSetAsIndicator, "toolTipMessage": toolTipMessage }
}
