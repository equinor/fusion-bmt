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

export type PortfolioByProjectId = {
    [projectId: string]: string
}

export type EvaluationsWithPortfolio = {
    [key: string]: Evaluation[]
}

export const noPortfolioKey = 'No portfolio'

export const useEvaluationsWithPortfolio = (evaluations: Evaluation[] | undefined): EvaluationsWithPortfolio | undefined => {
    const apiClients = useApiClients()
    const [allEvaluationsWithPortfolio, setAllEvaluationsWithPortfolio] = React.useState<EvaluationsWithPortfolio | undefined>(undefined)

    const collectUniquePortfolios = async () => {
        const contexts = await apiClients.context.getContextsAsync()
        const portfolios: string[] = contexts.data.filter(t => t.type.id === 'ProjectMaster').map(pm => pm.value.portfolioOrganizationalUnit).filter(b => b !== null)
        const uniquePortfolios = portfolios.filter((v, i, a) => a.indexOf(v) === i)
        return uniquePortfolios
    }

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

    const lookupPortfolio = async (projectId: string) => {
        const project = await apiClients.context.getContextAsync(projectId)
        const projectMasterId = project.data.value.projectMasterId

        if (projectMasterId) {
            const projectMaster = await apiClients.context.queryContextsAsync(projectMasterId, ContextTypes.ProjectMaster)
            const portfolio = projectMaster.data[0].value.portfolioOrganizationalUnit
            return portfolio
        }
        return ''
    }

    const assignPortfoliosToId = async (projectIds: string[]) => {
        const projectIdsWithPortfolios: PortfolioByProjectId = {}

        await Promise.all(
            projectIds.map(async projectId => {
                try {
                    const portfolio = await lookupPortfolio(projectId)
                    projectIdsWithPortfolios[projectId] = portfolio
                } catch (err) {
                    projectIdsWithPortfolios[projectId] = ''
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
            collectUniquePortfolios().then(portfolios => {
                portfolios.forEach(portfolio => {
                    evaluationsWithPortfolio[portfolio] = []
                })
            })
            // Since many evaluations have the same projectId, and thus the same portfolio, we are only doing lookups
            // on each projectId instead of each evaluation to save loading time
            const projectIds = collectUniqueProjectIds(evaluations)

            assignPortfoliosToId(projectIds).then(projectIdsWithPortfolios => {
                evaluations.forEach(evaluation => {
                    const projectId = evaluation.project && evaluation.project.fusionProjectId

                    if (projectId) {
                        const portfolio = projectIdsWithPortfolios[projectId]

                        if (portfolio) {
                            if (evaluationsWithPortfolio[portfolio]) {
                                evaluationsWithPortfolio[portfolio].push(evaluation)
                            } else {
                                evaluationsWithPortfolio[portfolio] = [evaluation]
                            }
                        } else {
                            evaluationsWithPortfolio[noPortfolioKey].push(evaluation)
                        }
                    } else {
                        evaluationsWithPortfolio[noPortfolioKey].push(evaluation)
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
