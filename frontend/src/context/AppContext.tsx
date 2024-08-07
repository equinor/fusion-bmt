import { FC, createContext, ReactNode, useContext, useMemo, useState, Dispatch, SetStateAction, useEffect } from 'react'
import { Evaluation, ProjectOption } from '../api/models'
import { Context } from '@equinor/fusion'
import { useContextApi } from '../api/useContextApi'

interface AppContextType {
    evaluation: Evaluation | undefined
    setEvaluation: Dispatch<SetStateAction<Evaluation | undefined>>
    projects: Context[]
    setProjects: Dispatch<SetStateAction<Context[]>>
    isFetchingProjects: boolean
    setIsFetchingProjects: Dispatch<SetStateAction<boolean>>
    currentProject: ProjectOption | undefined
    setCurrentProject: Dispatch<SetStateAction<ProjectOption | undefined>>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [evaluation, setEvaluation] = useState<Evaluation | undefined>(undefined)
    const [projects, setProjects] = useState<Context[]>([])
    const [currentProject, setCurrentProject] = useState<ProjectOption | undefined>(undefined)
    const [isFetchingProjects, setIsFetchingProjects] = useState<boolean>(false)
    const apiClients = useContextApi()

    useEffect(() => {
        setIsFetchingProjects(true)

        apiClients.getAllProjects().then(projects => {
            setProjects(projects.filter((project: Context) => project.type.id === "ProjectMaster"))
            setIsFetchingProjects(false)
        })
    }, [])

    const value = useMemo(
        () => ({
            evaluation,
            setEvaluation,
            projects,
            setProjects,
            isFetchingProjects,
            setIsFetchingProjects,
            currentProject,
            setCurrentProject,
        }),
        [evaluation, setEvaluation, projects, setProjects, isFetchingProjects, setIsFetchingProjects, currentProject, setCurrentProject]
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
