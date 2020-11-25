
import { Barrier, Organization, Role } from "../api/models"

const barrierToString = (barrier: Barrier): string => {
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

const organizationToString = (organization: Organization): string => {
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

const roleToString = (role: Role): string => {
    switch (role) {
    case Role.Participant:
        return "Participant"
    case Role.Facilitator:
        return "Facilitator"
    case Role.ReadOnly:
        return "ReadOnly"
    }
}

export { barrierToString, organizationToString, roleToString }
