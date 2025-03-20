import { Action, Evaluation, Participant, Progression, Role } from '../api/models'
import {
    participantCanEditAction,
    participantCanInputFollowUp,
    participantCanInputIndividual,
    participantCanInputPreparation,
    participantCanInputWorkshop,
    participantCanProgressEvaluation,
} from './RoleBasedAccess'

export const disableActionEdit = (isEditingFromDashboard: boolean, participant: Participant | undefined, action: Action) => {
    if (action.isVoided || action.completed) {
        return true
    }
    if (isEditingFromDashboard) {
        return false
    }
    return !participantCanEditAction(participant)
}

export const disableProgression = (evaluation: Evaluation, participant: Participant | undefined, viewProgression: Progression) => {
    if (evaluation.progression !== viewProgression) {
        return true
    }
    return !participantCanProgressEvaluation(participant)
}

export const disableProgressionFollowUp = (
    evaluation: Evaluation,
    participant: Participant | undefined,
    viewProgression: Progression,
    userIsAdmin: boolean
) => {
    if (evaluation.progression !== viewProgression) {
        return true
    }
    if (userIsAdmin) {
        return false
    }
    return !participantCanProgressEvaluation(participant)
}

export const disableCompleteSwitch = (participant: Participant | undefined, evaluation: Evaluation, viewProgression: Progression) => {
    if (!participant) {
        return true
    }
    if (evaluation.progression !== viewProgression) {
        return true
    }
    switch (viewProgression) {
        case Progression.Individual:
            return !participantCanInputIndividual(participant)
        case Progression.Preparation:
            return !participantCanInputPreparation(participant)
        case Progression.Workshop:
            return !participantCanInputWorkshop(participant)
        default:
            return true
    }
}

export const disableAnswer = (
    participant: Participant | undefined,
    evaluation: Evaluation,
    viewProgression: Progression,
    isAdmin: boolean
) => {
    if (isAdmin) {
        /* Admins can edit answers in followup and followup completed */
        if (viewProgression === Progression.FollowUp && evaluation.progression === Progression.Finished) {
            return false
        }
        if (viewProgression === Progression.FollowUp && evaluation.progression === Progression.FollowUp) {
            return false
        }
    }

    if (!participant) {
        return true
    }
    if (evaluation.progression !== viewProgression || participant.progression !== viewProgression) {
        /* In Individual and Workshop, only facilitators can answer questions
         if the evaluation or the participant is not on the current progression */
        if (viewProgression === Progression.Individual || viewProgression === Progression.Workshop) {
            return participant.role !== Role.Facilitator
        }
        /* Facilitators can edit answers on FollowUp even if the evaluation is finished */
        if (viewProgression === Progression.FollowUp && evaluation.progression === Progression.Finished) {
            return participant.role !== Role.Facilitator
        }
        return true
    }
    switch (viewProgression) {
        case Progression.Individual:
            return !participantCanInputIndividual(participant)
        case Progression.Preparation:
            return !participantCanInputPreparation(participant)
        case Progression.Workshop:
            return !participantCanInputWorkshop(participant)
        case Progression.FollowUp:
            return !participantCanInputFollowUp(participant)
        default:
            return true
    }
}
