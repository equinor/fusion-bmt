import React from 'react'

import { ModalSideSheet } from '@equinor/fusion-components'
import { CircularProgress } from '@equinor/eds-core-react'

import { Participant, Question } from '../../../api/models'
import { DataToCreateAction } from '../../../api/mutations'
import ActionCreateForm from './ActionCreateForm'
import { useAllPersonDetails } from '../utils'

interface Props {
    open: boolean
    connectedQuestion: Question
    possibleAssignees: Participant[]
    onActionCreate: (action: DataToCreateAction) => void
    onClose: () => void
}

const ActionCreateSidebar = ({ open, connectedQuestion, possibleAssignees, onActionCreate, onClose }: Props) => {
    const { allPersonDetails: personDetailsList, isLoading } = useAllPersonDetails(possibleAssignees)

    return (
        <ModalSideSheet header={`Add Action`} show={open} size="large" onClose={onClose} isResizable={false}>
            {isLoading && (
                <div style={{ textAlign: 'center' }}>
                    <CircularProgress />
                </div>
            )}
            {!isLoading && (
                <div style={{ margin: 20 }}>
                    <ActionCreateForm
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

export default ActionCreateSidebar
