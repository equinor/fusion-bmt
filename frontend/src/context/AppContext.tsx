import { FC, createContext, ReactNode, useContext, useMemo, useState, Dispatch, SetStateAction } from 'react'
import { Evaluation } from '../api/models'

interface AppContextType {
    evaluation: Evaluation | undefined
    setEvaluation: Dispatch<SetStateAction<Evaluation | undefined>>
}
const AppContext = createContext<AppContextType | undefined>(undefined)

const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [evaluation, setEvaluation] = useState<Evaluation | undefined>(undefined)

    const value = useMemo(
        () => ({
            evaluation,
            setEvaluation,
        }),
        [evaluation, setEvaluation]
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
