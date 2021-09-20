import * as faker from 'faker'

export class FusionProject {
    id: string
    name: string

    constructor({ id, name }: { id: string; name: string }) {
        this.id = id
        this.name = name
    }
}

export const fusionProject1 = new FusionProject({
    id: '123',
    name: 'Banana Banana',
})

export const fusionProject2 = new FusionProject({
    id: '234',
    name: 'Sweet Lemon',
})

export const fusionProject3 = new FusionProject({
    id: '345',
    name: 'Happy Papaya',
})

export const fusionProject4 = new FusionProject({
    id: '456',
    name: 'Rotten Mango',
})

export const fusionProject5 = new FusionProject({
    id: '567',
    name: 'Tired Avocado',
})

export const fusionProject6 = new FusionProject({
    id: '678',
    name: 'Broken Coconut',
})

export const fusionProjects = [fusionProject1, fusionProject2, fusionProject3, fusionProject4, fusionProject5, fusionProject6]

export function findFusionProjectByID(id: string) {
    return fusionProjects.filter(p => p.id == id)[0]
}

export function getFusionProjectData(project: FusionProject) {
    return {
        id: project.id,
        externalId: 'M.O0000.00.0.0000',
        source: null,
        type: { id: 'Project', isChildType: true, parentTypeIds: ['ProjectMaster'] },
        value: { wbs: 'M.O0000.00.0.0000', projectMasterId: null, isValid: faker.datatype.boolean() },
        title: project.name,
        isActive: faker.datatype.boolean(),
        isDeleted: faker.datatype.boolean(),
        created: '2020-09-01T20:20:00.00+00:00',
        updated: '2020-10-01T20:20:00.00+00:00',
    }
}
