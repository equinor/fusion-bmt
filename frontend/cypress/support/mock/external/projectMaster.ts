import { fusionProjects, FusionProject } from './projects'

export class ProjectMaster {
    id: string
    title: string
    portfolioOrganizationalUnit: string
    projects: FusionProject[]

    constructor(id: string, title: string, portfolioOrganizationalUnit: string, projects: FusionProject[]) {
        this.id = id
        this.title = title
        this.portfolioOrganizationalUnit = portfolioOrganizationalUnit
        this.projects = projects
    }
}

export function findProjectMasterForProject(projectMasterId: string) {
    return projectMasters.find(p => p.projects.find(o => o.projectMasterId === projectMasterId))
}

const projectMaster1 = new ProjectMaster(
    '1',
    'Bay Master',
    'Green Bay',
    fusionProjects.filter(p => p.projectMasterId === '1')
)
const projectMaster2 = new ProjectMaster(
    '2',
    'Ray of light',
    'Solar eclipse',
    fusionProjects.filter(p => p.projectMasterId === '2')
)

export const projectMasters = [projectMaster1, projectMaster2]

export function getPortfolioData(projectMaster: ProjectMaster | undefined) {
    return {
        title: projectMaster?.title,
        value: {
            portfolioOrganizationalUnit: projectMaster?.portfolioOrganizationalUnit,
        },
    }
}
