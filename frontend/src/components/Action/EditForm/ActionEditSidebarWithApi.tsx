import { useEffect, useState } from 'react'
import { Action, Participant, Question } from '../../../api/models'
import ActionEditSidebar from './ActionEditSidebar'
import { useCreateNoteMutation, useEditActionMutation } from '../../../api/mutations'
import { apiErrorMessage } from '../../../api/error'

interface Props {
    action: Action
    isOpen: boolean
    onClose: () => void
    connectedQuestion: Question
    possibleAssignees: Participant[]
}

const ActionEditSidebarWithApi = ({ action, isOpen, onClose, connectedQuestion, possibleAssignees }: Props) => {
    const { editAction, loading: isActionSaving, error: errorEditingAction } = useEditActionMutation()
    const { createNote, note, loading: isNoteSaving, error: errorCreatingNote } = useCreateNoteMutation()
    const [actionError, setActionError] = useState('')
    const [noteError, setNoteError] = useState('')
    const [localNote, setLocalNote] = useState<string>('')

    useEffect(() =>  {
        if (errorEditingAction) {
            setActionError(apiErrorMessage('Could not save changes to action'))
        } else {
            setActionError('')
        }
    }, [errorEditingAction])

    useEffect(() =>  {
        if (errorCreatingNote) {
            setNoteError(apiErrorMessage('Could not create note'))
        } else {
            setNoteError('')
        }
    }, [errorCreatingNote])

    const onChangeNote = (value: string) => {
        setLocalNote(value)
    }

    const onCreateNote = (text: string) => {
        if (!isNoteSaving) {
            createNote(action.id, text)
        }
    }

    useEffect(() =>  {
        if (note) {
            setLocalNote('')
        }
    }, [note])

    return (
        <ActionEditSidebar
            action={action}
            open={isOpen}
            onClose={onClose}
            connectedQuestion={connectedQuestion}
            possibleAssignees={possibleAssignees}
            isActionSaving={isActionSaving}
            isNoteSaving={isNoteSaving}
            onActionEdit={editAction}
            onCreateNote={onCreateNote}
            onChangeNote={onChangeNote}
            note={localNote}
            apiErrorAction={actionError}
            apiErrorNote={noteError}
        />
    )
}

export default ActionEditSidebarWithApi
