import {
    FC,
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
    Dispatch,
    SetStateAction,
    useEffect
} from 'react'
import { Evaluation, Project, Status } from '../api/models'
import { useContextApi } from '../api/useContextApi'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'
import { useCurrentUser } from '@equinor/fusion-framework-react-app/framework'
import { gql, useQuery, useApolloClient } from '@apollo/client'
import { EVALUATION_DASHBOARD_FIELDS_FRAGMENT, PARTICIPANTS_ARRAY_FRAGMENT } from '../api/fragments'

interface ProjectOption {
    title: string
    id: string
}
interface AppContextType {
    isFetchingProjects: boolean
    setIsFetchingProjects: Dispatch<SetStateAction<boolean>>
    projects: Project[]
    loadingProjects: boolean
    projectOptions: ProjectOption[]
    projectsByUser: Project[]
    projectsByUserHidden: Project[]
    currentProject: Project | undefined
    setCurrentProject: Dispatch<SetStateAction<Project | undefined>>
    evaluations: Evaluation[] | undefined
    setEvaluationsFetched: Dispatch<SetStateAction<boolean>>
    activeEvaluations: Evaluation[] | undefined
    loadingEvaluations: boolean
    evaluationsByUser: Evaluation[]
    evaluationsByProject: Evaluation[]
    evaluationsByUserProject: Evaluation[]
    evaluationsHidden: Evaluation[]
    evaluationsByProjectHidden: Evaluation[]
    currentEvaluation: Evaluation | undefined
    setCurrentEvaluation: Dispatch<SetStateAction<Evaluation | undefined>>
}
const AppContext = createContext<AppContextType | undefined>(undefined)

export const PROJECT_FIELDS_FRAGMENT = gql`
    fragment ProjectFields on Project {
        id
        externalId
        fusionProjectId
        __typename
    }
`

const GET_PROJECTS = gql`
    query {
        projects {
            ...ProjectFields
        }
    }
    ${PROJECT_FIELDS_FRAGMENT}
`

const GET_EVALUATIONS = gql`
    query {
        evaluations {
            ...EvaluationDashboardFields
            ...ParticipantsArray
        }
    }
    ${EVALUATION_DASHBOARD_FIELDS_FRAGMENT}
    ${PARTICIPANTS_ARRAY_FRAGMENT}
`

interface QueryProps {
    dbProjects?: Project[]
}

const useGetAllProjects = (): QueryProps => {
    const { data } = useQuery<{ projects: Project[] }>(GET_PROJECTS)
    return { dbProjects: data?.projects ? data?.projects : [] }
}

const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const apiClients = useContextApi()
    const user = useCurrentUser()
    const apolloClient = useApolloClient()

    const [pageReload, setPageReload] = useState<boolean>(false)
    const [contexts, setContexts] = useState<any[]>([])

    const { currentContext } = useModuleCurrentContext()

    const [isFetchingProjects, setIsFetchingProjects] = useState<boolean>(true)
    const { dbProjects } = useGetAllProjects()
    const [projects, setProjects] = useState<Project[]>([])
    const [loadingProjects, setLoadingProjects] = useState<boolean>(false)
    const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([])
    const [projectsByUser, setProjectsByUser] = useState<Project[]>([])
    const [projectsByUserFetched, setProjectsByUserFetched] = useState<boolean>(false)
    const [projectsByUserHidden, setProjectsByUserHidden] = useState<Project[]>([])
    const [projectsByUserHiddenFetched, setProjectsByUserHiddenFetched] = useState<boolean>(false)
    const [currentProject, setCurrentProject] = useState<Project | undefined>(undefined)

    const [evaluations, setEvaluations] = useState<Evaluation[]>([])
    const [loadingEvaluations, setLoadingEvaluations] = useState<boolean>(false)
    const [evaluationsFetched, setEvaluationsFetched] = useState<boolean>(false)

    const [activeEvaluations, setActiveEvaluations] = useState<Evaluation[]>([])

    const [evaluationsByUser, setEvaluationsByUser] = useState<Evaluation[]>([])
    const [evaluationsByUserFetched, setEvaluationsByUserFetched] = useState<boolean>(false)

    const [evaluationsHidden, setEvaluationsHidden] = useState<Evaluation[]>([])
    const [evaluationsHiddenFetched, setEvaluationsHiddenFetched] = useState<boolean>(false)

    const [evaluationsByUserProject, setEvaluationsByUserProject] = useState<Evaluation[]>([])
    const [evaluationsByProject, setEvaluationsByProject] = useState<Evaluation[]>([])
    const [evaluationsByProjectHidden, setEvaluationsByProjectHidden] = useState<Evaluation[]>([])
    const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | undefined>(undefined)

    useEffect(() => {
        setEvaluationsHiddenFetched(false)
        setEvaluationsByUserFetched(false)
        setEvaluationsFetched(false)
        setProjectsByUserHiddenFetched(false)
        setProjectsByUserFetched(false)
    }, [currentContext])

    useEffect(() => {
        setPageReload(currentContext !== undefined && currentContext !== null)
        if ((currentContext === undefined || currentContext === null) && pageReload) {
            window.location.reload()
        }
        if (contexts.length === 0) {
            apiClients.getAll().then(contexts => {
                setContexts(contexts)
            })
        }
        if (contexts.length > 0 && dbProjects && dbProjects.length > 0) {
            setIsFetchingProjects(true)
            let tempProjects: Project[] = []
            contexts.forEach(context => {
                dbProjects.forEach(dbProject => {
                    if (context.externalId === dbProject.externalId) {
                        tempProjects.push({
                            createDate: context.created,
                            id: dbProject.id,
                            externalId: context.externalId,
                            fusionProjectId: context.id,
                            title: context.title,
                            evaluations: []
                        })
                    }
                })
            })
            tempProjects = tempProjects.filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.id === value.id || t.externalId === value.externalId || t.fusionProjectId === value.fusionProjectId
                ))
            )
            setProjects(tempProjects)
            setIsFetchingProjects(false)
        }
        if (projects.length > 0) {
            let tempProjectOptions: ProjectOption[] = []
            projects.forEach((project: Project) => {
                if (project.title && project.fusionProjectId !== '') {
                    tempProjectOptions.push({
                        title: project.title,
                        id: project.externalId,
                    })
                }
            })
            setProjectOptions(tempProjectOptions)
        }
    }, [contexts, dbProjects])

    useEffect(() => {
        if (!currentContext) {
            setCurrentProject(undefined)
            return
        }

        if (projects?.length > 0) {
            const project = projects.find(project => project.externalId === currentContext.externalId)
            setCurrentProject(project)
        }
    }, [currentContext, projects])

    useEffect(() => {
        if (projects.length > 0 && evaluationsByUserFetched && evaluationsByUser.length > 0 && !projectsByUserFetched) {
            setLoadingProjects(true)

            const uniqueExternalIds = new Set<string>()
            const tempProjectsByUser: Project[] = []

            evaluationsByUser.forEach((ebu: Evaluation) => {
                const externalId = ebu.project?.externalId
                if (externalId && !uniqueExternalIds.has(externalId)) {
                    uniqueExternalIds.add(externalId)
                    const project = projects.find((p: Project) => p?.externalId === externalId)
                    if (project) {
                        tempProjectsByUser.push(project)
                    }
                }
            })

            setProjectsByUser(tempProjectsByUser)
            setProjectsByUserFetched(true)
            setLoadingProjects(false)
        }
    }, [projects, evaluationsByUser, evaluationsByUserFetched, projectsByUserFetched]);

    useEffect(() => {
        if (projects.length > 0 && evaluationsHiddenFetched && evaluationsHidden.length > 0 && !projectsByUserHiddenFetched) {
            setLoadingProjects(true)

            const uniqueExternalIds = new Set<string>()
            const tempProjectsByUserHidden: Project[] = []

            evaluationsHidden.forEach((ebu: Evaluation) => {
                const externalId = ebu.project?.externalId
                if (externalId && !uniqueExternalIds.has(externalId)) {
                    uniqueExternalIds.add(externalId)
                    const project = projects.find((p: Project) => p?.externalId === externalId)
                    if (project) {
                        tempProjectsByUserHidden.push(project)
                    }
                }
            })

            setProjectsByUserHidden(tempProjectsByUserHidden)
            setProjectsByUserHiddenFetched(true)
            setLoadingProjects(false)
        }
    }, [projects, evaluationsHidden, evaluationsHiddenFetched, projectsByUserHiddenFetched])

    useEffect(() => {
        if (!evaluationsFetched) {
            setLoadingEvaluations(true)
            apolloClient.query({ query: GET_EVALUATIONS })
                .then(data => {
                    if (data.data.evaluations) {
                        setEvaluations(data.data.evaluations)
                        setEvaluationsFetched(true)
                    }
                })
                .catch(error => {
                    console.error("Error fetching evaluations:", error)
                })
                .finally(() => {
                    setLoadingEvaluations(false)
                })
        }
    }, [evaluationsFetched])

    useEffect(() => {
        if (evaluationsFetched) {
            const evalByUser: Evaluation[] = evaluations.filter(evaluation =>
                evaluation.participants.some(
                    participant => participant.azureUniqueId === user?.localAccountId
                )
            )
            const hiddenEvals: Evaluation[] = evaluations.filter(evaluation =>
                evaluation.status === Status.Voided
            )

            const activeEvals = evaluations.filter(
                evaluation => evaluation.status === Status.Active
            )

            setActiveEvaluations(activeEvals)
            setEvaluationsByUser(evalByUser)
            setEvaluationsByUserFetched(true)
            setEvaluationsHidden(hiddenEvals)
            setEvaluationsHiddenFetched(true)
        }
    }, [evaluations, evaluationsFetched])

    // Project evaluations
    const evalByProject = useMemo(() => {
        if (evaluationsFetched && currentProject) {
            return evaluations.filter(evaluation => evaluation.project?.externalId === currentProject.externalId)
        }
        return []
    }, [currentProject, evaluations, evaluationsFetched])

    const evalByUserProject = useMemo(() => {
        return evalByProject.filter(evaluation =>
            evaluation.participants.some(participant => participant.azureUniqueId === user?.localAccountId)
        )
    }, [evalByProject])

    const evalByProjectHidden = useMemo(() => {
        return evalByProject.filter(evaluation => evaluation.status === Status.Voided)
    }, [evalByProject])

    useEffect(() => {
        setEvaluationsByUserProject(evalByUserProject)
        setEvaluationsByProject(evalByProject)
        setEvaluationsByProjectHidden(evalByProjectHidden)
    }, [evalByUserProject, evalByProject, evalByProjectHidden])

    const value = useMemo(
        () => ({
            isFetchingProjects,
            setIsFetchingProjects,
            projects,
            loadingProjects,
            projectOptions,
            projectsByUser,
            projectsByUserHidden,
            currentProject,
            setCurrentProject,
            evaluations,
            setEvaluationsFetched,
            activeEvaluations,
            loadingEvaluations,
            evaluationsByUser,
            evaluationsByProject,
            evaluationsByUserProject,
            evaluationsHidden,
            evaluationsByProjectHidden,
            currentEvaluation,
            setCurrentEvaluation,
        }),
        [
            isFetchingProjects,
            setIsFetchingProjects,
            projects,
            loadingProjects,
            projectOptions,
            projectsByUser,
            projectsByUserHidden,
            currentProject,
            setCurrentProject,
            evaluations,
            setEvaluationsFetched,
            activeEvaluations,
            loadingEvaluations,
            evaluationsByUser,
            evaluationsByProject,
            evaluationsByUserProject,
            evaluationsHidden,
            evaluationsByProjectHidden,
            currentEvaluation,
            setCurrentEvaluation,
        ]
    )

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContextProvider')
    }
    return context
}

export { AppContextProvider }
