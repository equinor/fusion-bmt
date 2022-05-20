import React, { useEffect, useRef, useState } from 'react'
import { PersonDetails, useApiClients, ContextTypes } from '@equinor/fusion'
import { Validity } from '../components/Action/utils'
import { deriveNewSavingState, updateValidity } from '../views/helpers'
import { SavingState } from './Variables'
import { Evaluation } from '../api/models'
import { ApolloError } from '@apollo/client'

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
    const apiClients = useApiClients()

    const getAllPersonDetails = (azureUniqueIds: string[]): Promise<PersonDetails[]> => {
        const manyPromises: Promise<PersonDetails>[] = azureUniqueIds.map(azureUniqueId => {
            return apiClients.people.getPersonDetailsAsync(azureUniqueId).then(response => {
                return response.data
            })
        })

        return Promise.all(manyPromises)
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
    const apiClients = useApiClients()
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

    const lookupPortfolioAndProjectMaster = async (projectId: string) => {
        let project = await apiClients.context.getContextAsync(projectId)
        let projectMasterId = project.data.value.projectMasterId
        if (projectMasterId) {
            const projectMaster = await apiClients.context.queryContextsAsync(projectMasterId, ContextTypes.ProjectMaster)
            const portfolio = projectMaster.data[0].value.portfolioOrganizationalUnit
            const projectMasterTitle = projectMaster.data[0].title
            return [portfolio, projectMasterTitle]
        } else if (project.data.value.type === "ProjectMaster") {
            const portfolio = project.data.value.portfolioOrganizationalUnit
            const projectMasterTitle = project.data.title
            return [portfolio, projectMasterTitle]
        }
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
    const [valueValidity, setValueValidity] = useState<Validity>('default')

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
