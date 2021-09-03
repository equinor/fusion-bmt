import {Answer, Participant, Progression, Role} from "../api/models"


/** Role-based access to an Answer
 *
 * Facilitator and OrganizationLead has access to everyone's answers.
 * Participants and ReadOnly are not allowed to read other peoples _Individual_
 * answers.
 */
export const participantCanReadAnswer = (participant: Participant | undefined, answer: Answer) => {
    if (!participant) {
        return false
    }
    switch (participant.role) {
        case Role.Facilitator: // Intentional fall-through
        case Role.OrganizationLead:
            return true
        case Role.Participant: // Intentional fall-through
        case Role.ReadOnly:
            return (
                answer.progression !== Progression.Individual ||
                participant.id === answer.answeredBy?.id
            )
        default:
            return false
    }
}


/* Role-based rule for adding another Participant to the Evaluation */
export const participantCanAddParticipant = (participant: Participant | undefined) => {
    /* Currently this share the same access as for deleting Participants */
    return participantCanDeleteParticipant(participant)
}


/* Role-based rule for deleting another Participant from the Evaluation */
export const participantCanDeleteParticipant = (participant: Participant | undefined) => {
    if (!participant) {
        return false
    }
    switch (participant.role) {
        case Role.Facilitator: // Intentional fall-through
        case Role.OrganizationLead:
            return true
        case Role.Participant: // Intentional fall-through
        case Role.ReadOnly:
            return false
        default:
            return false
    }
}


/* Role-based rule for progressing an Evaluation */
export const participantCanProgressEvaluation = (participant: Participant | undefined) => {
    if (!participant) {
        return false
    }
    switch (participant.role) {
        case Role.Facilitator:
            return true
        case Role.OrganizationLead:
        case Role.Participant: // Intentional fall-through
        case Role.ReadOnly:
            return false
        default:
            return false
    }
}

/* Role-based rule for creating an action */
export const participantCanCreateAction = (participant: Participant | undefined) => {
    if (!participant) {
        return false
    }
    switch (participant.role) {
        case Role.Facilitator:
        case Role.OrganizationLead:
        case Role.Participant: // Intentional fall-through
            return true
        case Role.ReadOnly:
            return false
        default:
            return false
    }
}

/* Role-based rule for editing an action */
export const participantCanEditAction = (participant: Participant | undefined) => {
    if (!participant) {
        return false
    }
    switch (participant.role) {
        case Role.Facilitator:
        case Role.OrganizationLead:
        case Role.Participant: // Intentional fall-through
            return true
        case Role.ReadOnly:
            return false
        default:
            return false
    }
}

/* Role-based rule for deleting an action */
export const participantCanDeleteAction = (participant: Participant | undefined) => {
    if (!participant) {
        return false
    }
    switch (participant.role) {
        case Role.Facilitator:
        case Role.OrganizationLead:
        case Role.Participant: // Intentional fall-through
            return true
        case Role.ReadOnly:
            return false
        default:
            return false
    }
}

/* Role-based rule for access to the workshop summary */
export const participantCanViewWorkshopSummary = (participant: Participant | undefined) => {
    if (!participant) {
        return true
    }
    switch (participant.role) {
        case Role.Facilitator:
        case Role.OrganizationLead:
        case Role.Participant: // Intentional fall-through
        case Role.ReadOnly:
            return true
        default:
            return false
    }
}

/* Role-based rule for editing the workshop summary */
export const participantCanEditWorkshopSummary = (participant: Participant | undefined) => {
    if (!participant) {
        return false
    }
    switch (participant.role) {
        case Role.Facilitator:
            return true
        case Role.OrganizationLead:
        case Role.Participant: // Intentional fall-through
        case Role.ReadOnly:
            return false
        default:
            return false
    }
}

/* Role-based rule for input to Individual */
export const participantCanInputIndividual = (participant: Participant | undefined) => {
    if (!participant) {
        return false
    }
    switch (participant.role) {
        case Role.Facilitator:
        case Role.OrganizationLead:
        case Role.Participant: // Intentional fall-through
            return true
        case Role.ReadOnly:
            return false
        default:
            return false
    }
}

/* Role-based rule for input to Preparation */
export const participantCanInputPreparation = (participant: Participant | undefined) => {
    if (!participant) {
        return false
    }
    switch (participant.role) {
        case Role.Facilitator:
        case Role.OrganizationLead:
            return true
        case Role.Participant: // Intentional fall-through
        case Role.ReadOnly:
            return false
        default:
            return false
    }
}

/* Role-based rule for input to Workshop */
export const participantCanInputWorkshop = (participant: Participant | undefined) => {
    if (!participant) {
        return false
    }
    switch (participant.role) {
        case Role.Facilitator:
            return true
        case Role.OrganizationLead:
        case Role.Participant: // Intentional fall-through
        case Role.ReadOnly:
            return false
        default:
            return false
    }
}

/* Role-based rule for input to FollowUp */
export const participantCanInputFollowUp = (participant: Participant | undefined) => {
    if (!participant) {
        return false
    }
    switch (participant.role) {
        case Role.Facilitator:
            return true
        case Role.OrganizationLead:
        case Role.Participant: // Intentional fall-through
        case Role.ReadOnly:
            return false
        default:
            return false
    }
}
