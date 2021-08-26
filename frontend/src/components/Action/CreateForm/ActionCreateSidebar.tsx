import React from 'react'

import { ModalSideSheet } from '@equinor/fusion-components'
import { CircularProgress } from '@equinor/eds-core-react'
import { TextArea } from '@equinor/fusion-components'

import { Participant, Question } from '../../../api/models'
import { DataToCreateAction } from '../../../api/mutations'
import ActionCreateForm from './ActionCreateForm'
import { useAllPersonDetailsAsync } from '../../../utils/hooks'

interface Props {
    open: boolean
    connectedQuestion: Question
    possibleAssignees: Participant[]
    onActionCreate: (action: DataToCreateAction) => void
    onClose: () => void
    apiError?: string
    disableCreate?: boolean
}

const ActionCreateSidebar = ({
    open,
    connectedQuestion,
    possibleAssignees,
    onActionCreate,
    onClose,
    apiError,
    disableCreate = false,
}: Props) => {
    const { personDetailsList, isLoading } = useAllPersonDetailsAsync(possibleAssignees.map(assignee => assignee.azureUniqueId))

    return (
        <ModalSideSheet header={`Add Action`} show={open} size="large" onClose={onClose} isResizable={false}>
            {isLoading && (
                <div style={{ textAlign: 'center' }}>
                    <CircularProgress />
                </div>
            )}
            {apiError && (
                <div>
                    <TextArea value={apiError} onChange={() => {}} />
                </div>
            )}
            {!isLoading && (
                <div style={{ margin: 20 }} data-testid="create_action_dialog_body">
                    <ActionCreateForm
                        connectedQuestion={connectedQuestion}
                        possibleAssignees={possibleAssignees}
                        possibleAssigneesDetails={personDetailsList}
                        onActionCreate={onActionCreate}
                        onCancelClick={onClose}
                        disableCreate={disableCreate}
                    />
                </div>
            )}
        </ModalSideSheet>
    )
}

export default ActionCreateSidebar
