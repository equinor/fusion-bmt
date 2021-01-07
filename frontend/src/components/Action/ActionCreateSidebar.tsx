import React, { useEffect, useState } from 'react'

import { PersonDetails, useApiClients } from '@equinor/fusion'
import { ModalSideSheet } from '@equinor/fusion-components'

import { Participant, Question } from '../../api/models'
import ActionCreateForm from './ActionCreateForm'
import { CircularProgress } from '@equinor/eds-core-react'
import { DataToCreateAction } from '../../api/mutations'

interface Props {
    open: boolean
    connectedQuestion: Question
    possibleAssignees: Participant[]
    onActionCreate: (action: DataToCreateAction) => void
    onCloseClick: () => void
}

const ActionCreateSidebar = ({ open, connectedQuestion, possibleAssignees, onActionCreate, onCloseClick }: Props) => {
    const apiClients = useApiClients()
    const [personDetailsList, setPersonDetailsList] = useState<PersonDetails[]>([])

    const isLoading = personDetailsList.length !== possibleAssignees.length

    const getAllPersonDetails = (azureUniqueIds: string[]): Promise<PersonDetails[]> => {
        const manyPrommises: Promise<PersonDetails>[] = azureUniqueIds.map(azureUniqueId => {
            return apiClients.people.getPersonDetailsAsync(azureUniqueId).then(response => {
                return response.data
            })
        })

        return Promise.all(manyPrommises)
    }

    useEffect(() => {
        let shouldUpdate = true

        const azureUniqueIds = possibleAssignees.map(a => a.azureUniqueId)
        getAllPersonDetails(azureUniqueIds).then(fetchedPersonDetailsList => {
            if(shouldUpdate){
                setPersonDetailsList(fetchedPersonDetailsList)
            }
        })

        return () => {shouldUpdate = false}
    }, [possibleAssignees])

    return (
        <ModalSideSheet
            header='Add Action'
            show={open}
            size='large'
            onClose={onCloseClick}
            isResizable={false}
        >
            {isLoading &&
                <div style={{textAlign: "center"}}>
                    <CircularProgress />
                </div>
            }
            {!isLoading &&
                <div style={{margin: 20}}>
                    <ActionCreateForm
                        connectedQuestion={connectedQuestion}
                        possibleAssignees={possibleAssignees}
                        possibleAssigneesDetails={personDetailsList}
                        onActionCreate={onActionCreate}
                        onCancelClick={onCloseClick}
                    />
                </div>
            }
        </ModalSideSheet>
    )
}

export default ActionCreateSidebar
