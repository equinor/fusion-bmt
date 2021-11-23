import React, { useEffect, useRef, useState } from 'react'
import { PersonDetails, useApiClients, ContextTypes } from '@equinor/fusion'
import { Validity } from '../components/Action/utils'
import { deriveNewSavingState, updateValidity } from '../views/helpers'
import { SavingState } from './Variables'
import { Evaluation } from '../api/models'

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

export type PortfolioAndProjectMasterTitleByProjectId = {
    [projectId: string]: [string, string]
}

export type EvaluationsWithPortfolio = {
    [key: string]: EvaluationWithProjectMasterTitle[]
}

export interface EvaluationWithProjectMasterTitle {
    evaluation: Evaluation,
    projectMasterTitle: string
}

export const noPortfolioKey = 'No portfolio'

export const useEvaluationsWithPortfolio = (evaluations: Evaluation[] | undefined): EvaluationsWithPortfolio | undefined => {
    const apiClients = useApiClients()
    const [allEvaluationsWithPortfolio, setAllEvaluationsWithPortfolio] = React.useState<EvaluationsWithPortfolio | undefined>(undefined)

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
        const project = await apiClients.context.getContextAsync(projectId)
        const projectMasterId = project.data.value.projectMasterId

        if (projectMasterId) {
            const projectMaster = await apiClients.context.queryContextsAsync(projectMasterId, ContextTypes.ProjectMaster)
            const portfolio = projectMaster.data[0].value.portfolioOrganizationalUnit
            const projectMasterTitle = projectMaster.data[0].title
            return [portfolio, projectMasterTitle]
        }
        return ['', '']
    }

    const assignPortfoliosAndProjectMasterTitileToId = async (projectIds: string[]) => {
        const projectIdsWithPortfolios: PortfolioAndProjectMasterTitleByProjectId = {}

        await Promise.all(
            projectIds.map(async projectId => {
                try {
                    const [portfolio, projectMasterTitle] = await lookupPortfolioAndProjectMaster(projectId)
                    projectIdsWithPortfolios[projectId] = [portfolio, projectMasterTitle]
                } catch (err) {
                    projectIdsWithPortfolios[projectId] = ['', '']
                }
            })
        )

        return projectIdsWithPortfolios
    }

    useEffect(() => {
        if (evaluations) {
            const evaluationsWithPortfolio: EvaluationsWithPortfolio = {
                [noPortfolioKey]: [],
            }
            // Since many evaluations have the same projectId, and thus the same portfolio, we are only doing lookups
            // on each projectId instead of each evaluation to save loading time
            const projectIds = collectUniqueProjectIds(evaluations)

            assignPortfoliosAndProjectMasterTitileToId(projectIds).then(projectIdsWithPortfolios => {
                evaluations.forEach(evaluation => {
                    const projectId = evaluation.project && evaluation.project.fusionProjectId

                    if (projectId) {
                        const [portfolio, projectMasterTitle] = projectIdsWithPortfolios[projectId]
                        const evaluationWithProjectMasterTitle: EvaluationWithProjectMasterTitle = {
                            evaluation,
                            projectMasterTitle
                        }

                        if (portfolio) {
                            if (evaluationsWithPortfolio[portfolio]) {
                                evaluationsWithPortfolio[portfolio].push(evaluationWithProjectMasterTitle)
                            } else {
                                evaluationsWithPortfolio[portfolio] = [evaluationWithProjectMasterTitle]
                            }
                        } else {
                            evaluationsWithPortfolio[noPortfolioKey].push(evaluationWithProjectMasterTitle)
                        }
                    } else {
                        evaluationsWithPortfolio[noPortfolioKey].push({evaluation, projectMasterTitle: ''})
                    }
                })
                setAllEvaluationsWithPortfolio(evaluationsWithPortfolio)
            })
        }
    }, [evaluations])

    return allEvaluationsWithPortfolio
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

export const useSavingStateCheck = <Type>(isLoading: boolean, hasError: boolean, doWhenLoadingFinishes: () => void) => {
    const [savingState, setSavingState] = useState<SavingState>(SavingState.None)

    useEffectNotOnMount(() => {
        setSavingState(deriveNewSavingState(isLoading, savingState))

        if (!isLoading && !hasError) {
            doWhenLoadingFinishes()
        }
    }, [isLoading])

    useEffect(() => {
        if (hasError) {
            setSavingState(SavingState.NotSaved)
        }
    }, [hasError])

    return { savingState }
}
