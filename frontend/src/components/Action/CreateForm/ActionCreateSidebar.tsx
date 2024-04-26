import React from 'react'
import { CircularProgress } from '@equinor/eds-core-react'
import SideSheet from '@equinor/fusion-react-side-sheet'
import { Participant, Question } from '../../../api/models'
import ActionCreateForm from './ActionCreateForm'
import { useAllPersonDetailsAsync } from '../../../utils/hooks'
import { DataToCreateAction } from './ActionCreateSidebarWithApi'
import ErrorBanner from '../../ErrorBanner'
import { genericErrorMessage } from '../../../utils/Variables'

interface Props {
    open: boolean
    connectedQuestion: Question
    possibleAssignees: Participant[]
    onActionCreate: (action: DataToCreateAction) => void
    onClose: () => void
    disableCreate?: boolean
    creatingAction: boolean
    showErrorMessage: boolean
    setShowErrorMessage: (value: boolean) => void
}

const ActionCreateSidebar = ({
    open,
    connectedQuestion,
    possibleAssignees,
    onActionCreate,
    onClose,
    disableCreate = false,
    creatingAction,
    showErrorMessage,
    setShowErrorMessage,
}: Props) => {
    const { personDetailsList, isLoading } = useAllPersonDetailsAsync(possibleAssignees.map(assignee => assignee.azureUniqueId))

    return (
        <SideSheet
            isOpen={open}
            onClose={onClose}
            minWidth={550}
        >
            <SideSheet.Title title="Add Action" />
            <SideSheet.SubTitle subTitle="" />
            <SideSheet.Content>
                {isLoading && (
                    <div style={{ textAlign: 'center' }}>
                        <CircularProgress />
                    </div>
                )}
                {!isLoading && showErrorMessage && (
                    <ErrorBanner message={'Could not save action. ' + genericErrorMessage} onClose={() => setShowErrorMessage(false)} />
                )}
                {!isLoading && (
                    <div data-testid="create_action_dialog_body">
                        <ActionCreateForm
                            connectedQuestion={connectedQuestion}
                            possibleAssignees={possibleAssignees}
                            possibleAssigneesDetails={personDetailsList}
                            onActionCreate={onActionCreate}
                            onCancelClick={onClose}
                            disableCreate={disableCreate}
                            creatingAction={creatingAction}
                        />
                    </div>
                )}
            </SideSheet.Content>
        </SideSheet>
    )
}

export default ActionCreateSidebar
