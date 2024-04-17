import { Role } from '../api/models'

export type UserRolesInEvaluation = {
    evaluationId: string
    role: Role
}

export type ProjectIndicator = {
    projectId: string
    evaluationId: string
}

export type ProjectBMTScore = {
    projectId: string
    bmtScore: number
}
