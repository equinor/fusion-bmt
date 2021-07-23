import { useEffect, useState } from 'react'
import ActionCreateSidebar from './ActionCreateSidebar'
import { Participant, Question } from '../../../api/models'
import { useCreateActionMutation } from '../../../api/mutations'
import { apiErrorMessage } from '../../../api/error'

interface Props {
    isOpen: boolean
    connectedQuestion: Question
    possibleAssignees: Participant[]
    onClose: () => void
}

const ActionCreateSidebarWithApi = ({ isOpen, connectedQuestion, possibleAssignees, onClose }: Props) => {
    const { createAction, error: errorCreatingAction, action, loading } = useCreateActionMutation()
    const [error, setError] = useState('')

    // Wait for a response and only close Sideview if mutation was successful
    useEffect(() => {
        if (action) {
            onClose()
        }
    }, [action])

    useEffect(() => {
        if (errorCreatingAction) {
            setError(apiErrorMessage('Could not create action'))
        }
        else {
            setError('')
        }
    }, [errorCreatingAction])

    return (
        <ActionCreateSidebar
            open={isOpen}
            onClose={onClose}
            connectedQuestion={connectedQuestion}
            possibleAssignees={possibleAssignees}
            onActionCreate={createAction}
            apiError={error}
            disableCreate={loading}
        />
    )
}

export default ActionCreateSidebarWithApi
