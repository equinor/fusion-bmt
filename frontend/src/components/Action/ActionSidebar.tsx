import React, { useEffect, useState } from 'react'

import { PersonDetails, useApiClients } from '@equinor/fusion'
import { ModalSideSheet } from '@equinor/fusion-components'

import { Action, Participant, Question } from '../../api/models'
import ActionForm from './ActionForm'
import { CircularProgress } from '@equinor/eds-core-react'
import { DataToCreateAction } from '../../api/mutations'

interface Props {
    action: Action | undefined
    open: boolean
    connectedQuestion: Question
    possibleAssignees: Participant[]
    onActionCreate: (action: DataToCreateAction) => void
    onClose: () => void
}

const ActionSidebar = ({ action, open, connectedQuestion, possibleAssignees, onActionCreate, onClose }: Props) => {
    const apiClients = useApiClients()
    const [personDetailsList, setPersonDetailsList] = useState<PersonDetails[]>([])

    const isLoading = personDetailsList.length !== possibleAssignees.length
    const actionExists = action && action.id !== undefined

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

    return (
        <ModalSideSheet header={`${actionExists ? 'Edit' : 'Add'} Action`} show={open} size="large" onClose={onClose} isResizable={false}>
            {isLoading && (
                <div style={{ textAlign: 'center' }}>
                    <CircularProgress />
                </div>
            )}
            {!isLoading && (
                <div style={{ margin: 20 }}>
                    <ActionForm
                        action={action}
                        connectedQuestion={connectedQuestion}
                        possibleAssignees={possibleAssignees}
                        possibleAssigneesDetails={personDetailsList}
                        onActionCreate={onActionCreate}
                        onCancelClick={onClose}
                    />
                </div>
            )}
        </ModalSideSheet>
    )
}

export default ActionSidebar
