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
    loadingEvaluations: boolean
    evaluationsByUser: Evaluation[]
    evaluationsByProject: Evaluation[]
    evaluationsByUserProject: Evaluation[]
    evaluationsByUserHidden: Evaluation[]
    evaluationsByProjectHidden: Evaluation[]
    evaluationsByUserProjectHidden: Evaluation[]
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

const GET_EVALUATIONS_BY_USER = gql`
    query ($status: Status!, $azureUniqueId: String!) {
        evaluations(
            where: {
                status: {
                    eq: $status
                },
                participants: {
                    some: {
                        azureUniqueId: {
                            eq: $azureUniqueId
                        }
                    }
                }
            }
        ) {
            ...EvaluationDashboardFields
            ...ParticipantsArray
        }
    }
    ${EVALUATION_DASHBOARD_FIELDS_FRAGMENT}
    ${PARTICIPANTS_ARRAY_FRAGMENT}
`
const GET_EVALUATIONS_BY_USER_HIDDEN = gql`
    query ($status: Status!) {
        evaluations(
            where: {
                status: {
                    eq: $status
                }
            }
        ) {
            ...EvaluationDashboardFields
            ...ParticipantsArray
        }
    }
    ${EVALUATION_DASHBOARD_FIELDS_FRAGMENT}
    ${PARTICIPANTS_ARRAY_FRAGMENT}
`

const GET_EVALUATIONS_BY_USER_PROJECT = gql`
    query ($status: Status!, $azureUniqueId: String!, $projectId: String!) {
        evaluations(
            where: {
                status: {
                    eq: $status
                },
                project: {
                    externalId: {
                        eq: $projectId
                    }
                }
                participants: {
                    some: {
                        azureUniqueId: {
                            eq: $azureUniqueId
                        }
                    }
                }
            }
        ) {
            ...EvaluationDashboardFields
            ...ParticipantsArray
        }
    }
    ${EVALUATION_DASHBOARD_FIELDS_FRAGMENT}
    ${PARTICIPANTS_ARRAY_FRAGMENT}
`
const GET_EVALUATIONS_BY_USER_PROJECT_HIDDEN = gql`
    query ($status: Status!, $azureUniqueId: String!, $projectId: String!) {
        evaluations(
            where: {
                status: {
                    eq: $status
                },
                project: {
                    externalId: {
                        eq: $projectId
                    }
                }
                participants: {
                    some: {
                        azureUniqueId: {
                            eq: $azureUniqueId
                        }
                    }
                }
            }
        ) {
            ...EvaluationDashboardFields
            ...ParticipantsArray
        }
    }
    ${EVALUATION_DASHBOARD_FIELDS_FRAGMENT}
    ${PARTICIPANTS_ARRAY_FRAGMENT}
`

const GET_EVALUATIONS_BY_PROJECT = gql`
    query ($status: Status!, $projectId: String!) {
        evaluations(
            where: {
                status: {
                    eq: $status
                },
                project: {
                    externalId: {
                        eq: $projectId
                    }
                }
            }
        ) {
            ...EvaluationDashboardFields
            ...ParticipantsArray
        }
    }
    ${EVALUATION_DASHBOARD_FIELDS_FRAGMENT}
    ${PARTICIPANTS_ARRAY_FRAGMENT}
`
const GET_EVALUATIONS_BY_PROJECT_HIDDEN = gql`
    query ($status: Status!, $projectId: String!) {
        evaluations(
            where: {
                status: {
                    eq: $status
                },
                project: {
                    externalId: {
                        eq: $projectId
                    }
                }
            }
        ) {
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
    const [evaluationsByUser, setEvaluationsByUser] = useState<Evaluation[]>([])
    const [evaluationsByUserFetched, setEvaluationsByUserFetched] = useState<boolean>(false)
    const [evaluationsByUserHidden, setEvaluationsByUserHidden] = useState<Evaluation[]>([])
    const [evaluationsByUserHiddenFetched, setEvaluationsByUserHiddenFetched] = useState<boolean>(false)
    const [evaluationsByUserProject, setEvaluationsByUserProject] = useState<Evaluation[]>([])
    const [evaluationsByUserProjectFetched, setEvaluationsByUserProjectFetched] = useState<boolean>(false)
    const [evaluationsByUserProjectHidden, setEvaluationsByUserProjectHidden] = useState<Evaluation[]>([])
    const [evaluationsByUserProjectHiddenFetched, setEvaluationsByUserProjectHiddenFetched] = useState<boolean>(false)
    const [evaluationsByProject, setEvaluationsByProject] = useState<Evaluation[]>([])
    const [evaluationsByProjectFetched, setEvaluationsByProjectFetched] = useState<boolean>(false)
    const [evaluationsByProjectHidden, setEvaluationsByProjectHidden] = useState<Evaluation[]>([])
    const [evaluationsByProjectHiddenFetched, setEvaluationsByProjectHiddenFetched] = useState<boolean>(false)
    const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | undefined>(undefined)

    useEffect(() => {
        setEvaluationsByProjectFetched(false)
        setEvaluationsByProjectHiddenFetched(false)
        setEvaluationsByUserProjectHiddenFetched(false)
        setEvaluationsByUserProjectFetched(false)
        setEvaluationsByUserHiddenFetched(false)
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
        if (projects.length > 0 && evaluationsByUserHiddenFetched && evaluationsByUserHidden.length > 0 && !projectsByUserHiddenFetched) {
            setLoadingProjects(true)

            const uniqueExternalIds = new Set<string>()
            const tempProjectsByUserHidden: Project[] = []

            evaluationsByUserHidden.forEach((ebu: Evaluation) => {
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
    }, [projects, evaluationsByUserHidden, evaluationsByUserHiddenFetched, projectsByUserHiddenFetched])

    useEffect(() => {
        if (!evaluationsFetched) {
            apolloClient.query({ query: GET_EVALUATIONS }).then(data => {
                setLoadingEvaluations(true)
                if (data.data.evaluations) {
                    setEvaluations(data.data.evaluations)
                    setEvaluationsFetched(true)
                    setLoadingEvaluations(false)
                }
            })
        }
    }, [evaluationsFetched])

    useEffect(() => {
        if (user && !evaluationsByUserFetched) {
            apolloClient.query({ query: GET_EVALUATIONS_BY_USER, variables: { status: Status.Active, azureUniqueId: user.localAccountId } }).then(data => {
                setLoadingEvaluations(true)
                if (data.data.evaluations) {
                    setEvaluationsByUser(data.data.evaluations)
                    setEvaluationsByUserFetched(true)
                    setLoadingEvaluations(false)
                }
            })
        }
    }, [user, evaluationsByUserFetched])

    useEffect(() => {
        if (user && !evaluationsByUserHiddenFetched) {
            apolloClient.query({ query: GET_EVALUATIONS_BY_USER_HIDDEN, variables: { status: Status.Voided } }).then(data => {
                setLoadingEvaluations(true)
                if (data.data.evaluations) {
                    setEvaluationsByUserHidden(data.data.evaluations)
                    setEvaluationsByUserHiddenFetched(true)
                    setLoadingEvaluations(false)
                }
            })
        }
    }, [user, evaluationsByUserHiddenFetched])

    useEffect(() => {
        if (user && currentProject && !evaluationsByUserProjectFetched) {
            apolloClient.query({ query: GET_EVALUATIONS_BY_USER_PROJECT, variables: { status: Status.Active, azureUniqueId: user.localAccountId, projectId: currentProject.externalId } }).then(data => {
                setLoadingEvaluations(true)
                if (data.data.evaluations) {
                    setEvaluationsByUserProject(data.data.evaluations)
                    setEvaluationsByUserProjectFetched(true)
                    setLoadingEvaluations(false)
                }
            })
        }
    }, [user, currentProject, evaluationsByUserProjectFetched])

    useEffect(() => {
        if (user && currentProject && !evaluationsByUserProjectHiddenFetched) {
            apolloClient.query({ query: GET_EVALUATIONS_BY_USER_PROJECT_HIDDEN, variables: { status: Status.Voided, azureUniqueId: user.localAccountId, projectId: currentProject.externalId } }).then(data => {
                setLoadingEvaluations(true)
                if (data.data.evaluations) {
                    setEvaluationsByUserProjectHidden(data.data.evaluations)
                    setEvaluationsByUserProjectHiddenFetched(true)
                    setLoadingEvaluations(false)
                }
            })
        }
    }, [user, currentProject, evaluationsByUserProjectHiddenFetched])

    useEffect(() => {
        if (currentProject && !evaluationsByProjectFetched) {
            apolloClient.query({ query: GET_EVALUATIONS_BY_PROJECT, variables: { status: Status.Active, projectId: currentProject.externalId } }).then(data => {
                setLoadingEvaluations(true)
                if (data.data.evaluations) {
                    setEvaluationsByProject(data.data.evaluations)
                    setEvaluationsByProjectFetched(true)
                    setLoadingEvaluations(false)
                }
            })
        }
    }, [currentProject, evaluationsByProjectFetched])

    useEffect(() => {
        if (currentProject && !evaluationsByProjectHiddenFetched) {
            apolloClient.query({ query: GET_EVALUATIONS_BY_PROJECT_HIDDEN, variables: { status: Status.Voided, projectId: currentProject.externalId } }).then(data => {
                setLoadingEvaluations(true)
                if (data.data.evaluations) {
                    setEvaluationsByProjectHidden(data.data.evaluations)
                    setEvaluationsByProjectHiddenFetched(true)
                    setLoadingEvaluations(false)
                }
            })
        }
    }, [currentProject, evaluationsByProjectHiddenFetched])

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
            loadingEvaluations,
            evaluationsByUser,
            evaluationsByProject,
            evaluationsByUserProject,
            evaluationsByUserHidden,
            evaluationsByProjectHidden,
            evaluationsByUserProjectHidden,
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
            loadingEvaluations,
            evaluationsByUser,
            evaluationsByProject,
            evaluationsByUserProject,
            evaluationsByUserHidden,
            evaluationsByProjectHidden,
            evaluationsByUserProjectHidden,
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
