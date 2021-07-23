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
    const { createAction, error: errorCreatingAction } = useCreateActionMutation()
    const [error, setError] = useState('')

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
            onActionCreate={action => {
                onClose()
                createAction(action)
            }}
            apiError={error}
        />
    )
}

export default ActionCreateSidebarWithApi
