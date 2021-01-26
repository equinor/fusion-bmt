import React, { useEffect, useState } from 'react'

import { PersonDetails, useApiClients } from '@equinor/fusion'
import { ModalSideSheet } from '@equinor/fusion-components'

import { Action, Participant, Question } from '../../../api/models'
import ActionForm from './ActionEditForm'
import { CircularProgress } from '@equinor/eds-core-react'
import { DataToCreateAction } from '../../../api/mutations'
import SaveIndicator from '../../SaveIndicator'
import { SavingState } from '../../../utils/Variables'

interface Props {
    action: Action | undefined
    isActionSaving: boolean
    isNoteSaving: boolean
    open: boolean
    connectedQuestion: Question
    possibleAssignees: Participant[]
    onActionCreate: (action: DataToCreateAction) => void
    onActionEdit: (action: Action) => void
    onNoteCreate: (actionId: string, text: string) => void
    onClose: () => void
}

const ActionSidebar = ({
    action,
    isActionSaving,
    isNoteSaving,
    open,
    connectedQuestion,
    possibleAssignees,
    onActionCreate,
    onActionEdit,
    onNoteCreate,
    onClose,
}: Props) => {
    const apiClients = useApiClients()
    const [personDetailsList, setPersonDetailsList] = useState<PersonDetails[]>([])
    const [savingState, setSavingState] = useState<SavingState>(SavingState.None)

    const isLoading = personDetailsList.length !== possibleAssignees.length
    const actionExists = action && action.id !== undefined

    useEffect(() => {
        if (isActionSaving || isNoteSaving) {
            setSavingState(SavingState.Saving)
        } else {
            if (savingState === SavingState.Saving) {
                setSavingState(SavingState.Saved)
            } else {
                setSavingState(SavingState.None)
            }
        }
    }, [isActionSaving, isNoteSaving])

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
        <ModalSideSheet
            header={`${actionExists ? 'Edit' : 'Add'} Action`}
            show={open}
            size="large"
            onClose={onClose}
            isResizable={false}
            headerIcons={[<SaveIndicator savingState={savingState} />]}
        >
            {isLoading && (
                <div style={{ textAlign: 'center' }}>
                    <CircularProgress />
                </div>
            )}
            {!isLoading && (
                <div style={{ margin: 20 }}>
                    <ActionForm
                        action={action}
                        setSavingState={setSavingState}
                        connectedQuestion={connectedQuestion}
                        possibleAssignees={possibleAssignees}
                        possibleAssigneesDetails={personDetailsList}
                        onActionCreate={onActionCreate}
                        onActionEdit={onActionEdit}
                        onNoteCreate={onNoteCreate}
                        onCancelClick={onClose}
                    />
                </div>
            )}
        </ModalSideSheet>
    )
}

export default ActionSidebar
