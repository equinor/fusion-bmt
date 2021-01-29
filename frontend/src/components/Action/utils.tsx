import React, { useEffect, useState } from "react"

import { Icon, TextFieldProps } from "@equinor/eds-core-react"
import { error_filled } from "@equinor/eds-icons"
import { PersonDetails, useApiClients } from '@equinor/fusion'

import { Participant } from "../../api/models"

export type TextFieldChangeEvent = React.ChangeEvent<HTMLTextAreaElement> & React.ChangeEvent<HTMLInputElement>

export type Validity = Exclude<TextFieldProps['variant'], undefined | 'warning'>

export const ErrorIcon = <Icon size={16} data={error_filled} color="danger" />

export const checkIfTitleValid = (title: string) => {
    return title.length > 0
}

export const checkIfParticipantValid = (participant: Participant | undefined) => {
    return participant !== undefined
}

interface UseAllPersonDetailsResult {
    allPersonDetails: PersonDetails[]
    isLoading: boolean
}

export const useAllPersonDetails = (possibleAssignees: Participant[]): UseAllPersonDetailsResult => {
    const apiClients = useApiClients()
    const [personDetailsList, setPersonDetailsList] = useState<PersonDetails[]>([])

    const getAllPersonDetails = (azureUniqueIds: string[]): Promise<PersonDetails[]> => {
        const manyPromises: Promise<PersonDetails>[] = azureUniqueIds.map(azureUniqueId => {
            return apiClients.people.getPersonDetailsAsync(azureUniqueId).then(response => {
                return response.data
            })
        })

        return Promise.all(manyPromises)
    }

    useEffect(() => {
        let shouldUpdate = true

        const azureUniqueIds = possibleAssignees.map(a => a.azureUniqueId)
        getAllPersonDetails(azureUniqueIds).then(fetchedPersonDetailsList => {
            if (shouldUpdate) {
                setPersonDetailsList(fetchedPersonDetailsList)
            }
        })

        return () => {
            shouldUpdate = false
        }
    }, [possibleAssignees])

    return {
        allPersonDetails: personDetailsList,
        isLoading: personDetailsList.length !== possibleAssignees.length
    }
}
