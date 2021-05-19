import React, { useEffect, useRef, useState } from 'react'
import { PersonDetails, useApiClients } from '@equinor/fusion'
import { Organization } from '../api/models'

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
