
import { Barrier, Organization, Progression, Role } from "../api/models"

export const barrierToString = (barrier: Barrier): string => {
    switch (barrier) {
    case Barrier.Gm:
        return "General Matters"
    case Barrier.Ps1:
        return "Containment"
    case Barrier.Ps2:
        return "HVAC"
    case Barrier.Ps3:
        return "Leak Detection"
    case Barrier.Ps4:
        return "ESD"
    case Barrier.Ps6:
        return "Ignition Source Control"
    case Barrier.Ps7:
        return "Fire Detection"
    case Barrier.Ps12:
        return "Process Safety"
    case Barrier.Ps15:
        return "Layout"
    case Barrier.Ps22:
        return "HMI"
    }
}

export const organizationToString = (organization: Organization): string => {
    switch (organization) {
    case Organization.Commissioning:
        return "Commissioning"
    case Organization.Construction:
        return "Construction"
    case Organization.Engineering:
        return "Engineering"
    case Organization.PreOps:
        return "PreOps"
    case Organization.All:
        return "All"
    }
}

export const roleToString = (role: Role): string => {
    switch (role) {
    case Role.Participant:
        return "Participant"
    case Role.Facilitator:
        return "Facilitator"
    case Role.OrganizationLead:
        return "Organization Lead"
    case Role.ReadOnly:
        return "Read Only"
    }
}

export const progressionToString = (progression: Progression): string => {
    switch(progression) {
    case Progression.Nomination: return "Nomination"
    case Progression.Preparation: return "Preparation"
    case Progression.Alignment: return "Alignment"
    case Progression.Workshop: return "Workshop"
    case Progression.FollowUp: return "Follow-up"
    }
}
