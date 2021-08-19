import {Answer, Participant, Progression, Role} from "../api/models"


/** Role-based access to an Answer
 *
 * Facilitator and OrganizationLead has access to everyone's answers.
 * Participants and ReadOnly are not allowed to read other peoples _Individual_
 * answers.
 */
export const participantCanReadAnswer = (participant: Participant, answer: Answer) => {
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


/* Role-based rule for deleting another Participant from the Evaluation */
export const participantCanDeleteParticipant = (participantRole: Role) => {
    switch (participantRole) {
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
export const participantCanProgressEvaluation = (participantRole: Role) => {
    switch (participantRole) {
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
