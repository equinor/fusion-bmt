import React, { useEffect, useRef, useState } from 'react'
import { Validity } from '../components/Action/utils'
import { deriveNewSavingState, updateValidity } from '../views/helpers'
import { SavingState } from './Variables'
import { Evaluation } from '../api/models'
import { ApolloError } from '@apollo/client'
import { PersonDetails } from '@equinor/fusion-react-person'
import { usePeopleApi } from '../api/usePeopleApi'
import { useContextApi } from '../api/useContextApi'

export const useEffectNotOnMount = (f: () => void, deps: any[]) => {
    const firstUpdate = useRef(true)
    return useEffect(() => {
        if (firstUpdate.current === true) {
            firstUpdate.current = false
            return
        }
        return f()
    }, deps)
}

interface PersonDetailsResult {
    personDetailsList: PersonDetails[]
    isLoading: boolean
}

export const useAllPersonDetailsAsync = (azureUniqueIds: string[]): PersonDetailsResult => {
    const [personDetailsList, setPersonDetailsList] = useState<PersonDetails[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const apiClients = usePeopleApi()

    const getAllPersonDetails = async (azureUniqueIds: string[]): Promise<PersonDetails[]> => {
        const manyPromises: Promise<PersonDetails>[] = azureUniqueIds.map(azureUniqueId => {
            return apiClients.getById(azureUniqueId).then(response => {
                return {
                    azureId: response.azureUniqueId,
                    name: response.name,
                }
            })
        })

        let personDetails: PersonDetails[] = []

        await Promise.allSettled(manyPromises).then(results => results.forEach(element => {
            if (element.status === "fulfilled") {
                personDetails.push(element.value)
            }
        }))

        return personDetails
    }

    useEffect(() => {
        setIsLoading(true)
        getAllPersonDetails(azureUniqueIds).then(fetchedPersonDetailsList => {
            setPersonDetailsList(fetchedPersonDetailsList)
            setIsLoading(false)
        })
    }, [JSON.stringify(azureUniqueIds)])

    return { personDetailsList, isLoading }
}

export type PortfolioAndProjectMaster = {
    portfolio: string
    projectMasterTitle: string
}

export type PortfolioAndProjectMasterByProjectId = {
    [projectId: string]: PortfolioAndProjectMaster
}

export type EvaluationsByProjectMaster = {
    [projectMasterTitle: string]: Evaluation[]
}

export type EvaluationsByProjectMasterAndPortfolio = {
    [portfolio: string]: EvaluationsByProjectMaster
}

export const noPortfolioKey = 'No portfolio'
export const noProjectMasterTitle = 'No project master title'

export const useEvaluationsWithPortfolio = (evaluations: Evaluation[] | undefined): EvaluationsByProjectMasterAndPortfolio => {
    const apiClients = useContextApi()
    const [allEvaluationsWithProjectMasterAndPortfolio, setAllEvaluationsWithProjectMasterPortfolio] =
        React.useState<EvaluationsByProjectMasterAndPortfolio>({})

    const collectUniqueProjectIds = (evaluations: Evaluation[]) => {
        const projectIds: string[] = []
        evaluations.forEach(evaluation => {
            const projectId: string = evaluation.project && evaluation.project.fusionProjectId

            if (projectId && projectIds.indexOf(projectId) < 0) {
                projectIds.push(projectId)
            }
        })
        return projectIds
    }

    const cacheRef = useRef<Record<string, [string, string]>>({});

    const lookupPortfolioAndProjectMaster = async (projectId: string) => {
        if (cacheRef.current[projectId]) {
            return cacheRef.current[projectId];
        }

        let project = await apiClients.getById(projectId)
        let projectMasterId = project.externalId
        if (projectMasterId) {
            const portfolio = project.value.portfolioOrganizationalUnit
            const projectMasterTitle = project.title
            cacheRef.current[projectId] = [portfolio, projectMasterTitle];
            return [portfolio, projectMasterTitle]
        } else if (project.data.type.id === "ProjectMaster") {
            const portfolio = project.data.value.portfolioOrganizationalUnit
            const projectMasterTitle = project.data.title
            cacheRef.current[projectId] = [portfolio, projectMasterTitle];
            return [portfolio, projectMasterTitle]
        }
        cacheRef.current[projectId] = ['', ''];
        return ['', '']
    }

    const assignPortfoliosAndProjectMasterToId = async (projectIds: string[]) => {
        const projectIdsWithPortfoliosAndProjectMasters: PortfolioAndProjectMasterByProjectId = {}

        await Promise.all(
            projectIds.map(async projectId => {
                try {
                    const [portfolio, projectMasterTitle] = await lookupPortfolioAndProjectMaster(projectId)
                    projectIdsWithPortfoliosAndProjectMasters[projectId] = { portfolio, projectMasterTitle }
                } catch (err) {
                    projectIdsWithPortfoliosAndProjectMasters[projectId] = { portfolio: '', projectMasterTitle: '' }
                }
            })
        )

        return projectIdsWithPortfoliosAndProjectMasters
    }

    useEffect(() => {
        if (evaluations) {
            const evaluationsByProjectMasterAndPortfolio: EvaluationsByProjectMasterAndPortfolio = {
                [noPortfolioKey]: {
                    [noProjectMasterTitle]: [],
                },
            }
            // Since many evaluations have the same projectId, and thus the same portfolio, we are only doing lookups
            // on each projectId instead of each evaluation to save loading time
            const projectIds = collectUniqueProjectIds(evaluations)

            assignPortfoliosAndProjectMasterToId(projectIds).then(projectIdsWithPortfoliosAndProjectMaster => {
                evaluations.forEach(evaluation => {
                    const projectId = evaluation.project && evaluation.project.fusionProjectId

                    if (projectId) {
                        const { portfolio, projectMasterTitle } = projectIdsWithPortfoliosAndProjectMaster[projectId]

                        if (portfolio) {
                            if (evaluationsByProjectMasterAndPortfolio[portfolio]) {
                                if (evaluationsByProjectMasterAndPortfolio[portfolio][projectMasterTitle]) {
                                    evaluationsByProjectMasterAndPortfolio[portfolio][projectMasterTitle].push(evaluation)
                                } else {
                                    evaluationsByProjectMasterAndPortfolio[portfolio][projectMasterTitle] = [evaluation]
                                }
                            } else {
                                evaluationsByProjectMasterAndPortfolio[portfolio] = {
                                    [projectMasterTitle]: [evaluation],
                                }
                            }
                        } else {
                            if (projectMasterTitle === '') {
                                if (evaluationsByProjectMasterAndPortfolio[noPortfolioKey][noProjectMasterTitle]) {
                                    evaluationsByProjectMasterAndPortfolio[noPortfolioKey][noProjectMasterTitle].push(evaluation)
                                } else {
                                    evaluationsByProjectMasterAndPortfolio[noPortfolioKey][noProjectMasterTitle] = [evaluation]
                                }
                            } else {
                                if (evaluationsByProjectMasterAndPortfolio[noPortfolioKey][projectMasterTitle]) {
                                    evaluationsByProjectMasterAndPortfolio[noPortfolioKey][projectMasterTitle].push(evaluation)
                                } else {
                                    evaluationsByProjectMasterAndPortfolio[noPortfolioKey][projectMasterTitle] = [evaluation]
                                }
                            }
                        }
                    } else {
                        evaluationsByProjectMasterAndPortfolio[noPortfolioKey][noProjectMasterTitle].push(evaluation)
                    }
                })
                setAllEvaluationsWithProjectMasterPortfolio(evaluationsByProjectMasterAndPortfolio)
            })
        }
    }, [evaluations])

    return allEvaluationsWithProjectMasterAndPortfolio
}

export const useFilter = <Type>() => {
    const [filter, setFilter] = React.useState<Type[]>([])

    const onFilterToggled = (value: Type) => {
        let newFilter = [...filter]
        if (filter.includes(value)) {
            newFilter = newFilter.filter(val => val !== value)
        } else {
            newFilter.push(value)
        }
        setFilter(newFilter)
    }

    return { filter, onFilterToggled }
}

/*
 * Checks if the provided value is valid according to the provided validityCheck and returns a Validity object.
 * Updates the Validity every time the value changes.
 */
export const useValidityCheck = <Type>(value: Type, isValid: () => boolean) => {
    const [valueValidity, setValueValidity] = useState<Validity>()

    useEffectNotOnMount(() => {
        if (!isValid()) {
            setValueValidity('error')
        }
    }, [value])

    useEffect(() => {
        updateValidity(isValid(), valueValidity, setValueValidity)
    }, [value, valueValidity])

    return { valueValidity }
}

export const useShowErrorHook = (error: ApolloError | undefined) => {
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false)

    useEffectNotOnMount(() => {
        if (error !== undefined) {
            setShowErrorMessage(true)
        }
    }, [error])

    return { showErrorMessage, setShowErrorMessage }
}

export const useSavingStateCheck = (isLoading: boolean, hasError: boolean) => {
    const [savingState, setSavingState] = useState<SavingState>(SavingState.None)

    useEffectNotOnMount(() => {
        setSavingState(deriveNewSavingState(isLoading, savingState))
    }, [isLoading])

    useEffect(() => {
        if (hasError) {
            setSavingState(SavingState.NotSaved)
        }
    }, [hasError])

    return { savingState, setSavingState }
}
