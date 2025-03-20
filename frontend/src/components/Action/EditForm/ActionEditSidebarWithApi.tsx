import { useEffect, useState } from 'react'
import { ApolloError, gql, useMutation } from '@apollo/client'
import { Action, ClosingRemark, Note, Participant, Question } from '../../../api/models'
import ActionEditSidebar from './ActionEditSidebar'
import {
    ACTION_CLOSING_REMARKS_FRAGMENT,
    ACTION_FIELDS_FRAGMENT,
    ACTION_NOTES_FRAGMENT,
    CLOSING_REMARK_FIELDS_FRAGMENT,
    NOTE_FIELDS_FRAGMENT,
} from '../../../api/fragments'

interface Props {
    action: Action
    isOpen: boolean
    onClose: () => void
    connectedQuestion: Question
    possibleAssignees: Participant[]
    isEditingFromDashboard?: boolean
}

const ActionEditSidebarWithApi = ({ action, isOpen, onClose, connectedQuestion, possibleAssignees, isEditingFromDashboard }: Props) => {
    const { editAction, loading: isActionSaving, error: errorEditingAction } = useEditActionMutation()
    const { createNote, note, loading: isNoteSaving, error: errorCreatingNote } = useCreateNoteMutation()
    const {
        createClosingRemark,
        closingRemark,
        loading: isClosingRemarkSaving,
        error: errorCreatingClosingRemark,
    } = useCreateClosingRemarkMutation()
    const [localNote, setLocalNote] = useState<string>('')

    const onChangeNote = (value: string) => {
        setLocalNote(value)
    }

    const onCreateNote = (text: string) => {
        if (!isNoteSaving) {
            createNote(action.id, text)
        }
    }

    const onCreateClosingRemark = (text: string) => {
        if (!isClosingRemarkSaving) {
            createClosingRemark(action.id, text)
        }
    }

    useEffect(() => {
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
            onCreateClosingRemark={onCreateClosingRemark}
            isClosingRemarkSaved={closingRemark !== undefined}
            note={localNote}
            apiErrorAction={errorEditingAction}
            apiErrorNote={errorCreatingNote}
            apiErrorClosingRemark={errorCreatingClosingRemark}
            isEditingFromDashboard={isEditingFromDashboard}
        />
    )
}

export default ActionEditSidebarWithApi

interface EditActionMutationProps {
    editAction: (action: Action) => void
    loading: boolean
    action: Action | undefined
    error: ApolloError | undefined
}

const useEditActionMutation = (): EditActionMutationProps => {
    const EDIT_ACTION = gql`
        mutation EditAction(
            $actionId: String
            $assignedToId: String
            $azureUniqueId: String
            $description: String
            $dueDate: DateTime!
            $title: String
            $onHold: Boolean!
            $completed: Boolean!
            $priority: Priority!
        ) {
            editAction(
                actionId: $actionId
                assignedToId: $assignedToId
                azureUniqueId: $azureUniqueId
                description: $description
                dueDate: $dueDate
                title: $title
                onHold: $onHold
                completed: $completed
                priority: $priority
            ) {
                ...ActionFields
            }
        }
        ${ACTION_FIELDS_FRAGMENT}
    `

    const [editActionApolloFunc, { loading, data, error }] = useMutation(EDIT_ACTION, {
        update(cache, { data: { editAction: action } }) {
            const actionFragmentId: string = `Action:${action.id}`
            cache.writeFragment({
                id: actionFragmentId,
                data: action,
                fragmentName: 'ActionFields',
                fragment: ACTION_FIELDS_FRAGMENT,
            })
        },
    })

    const editAction = (action: Action) => {
        console.log('editAction', action)
        editActionApolloFunc({ variables: { ...action, actionId: action.id, assignedToId: action.assignedTo!.id, azureUniqueId: action.assignedTo?.azureUniqueId } })
    }

    return {
        editAction,
        loading,
        action: data?.editAction,
        error,
    }
}

interface CreateNoteMutationProps {
    createNote: (actionId: string, text: string) => void
    loading: boolean
    note: Note | undefined
    error: ApolloError | undefined
}

const useCreateNoteMutation = (): CreateNoteMutationProps => {
    const CREATE_NOTE = gql`
        mutation CreateNote($text: String, $actionId: String) {
            createNote(text: $text, actionId: $actionId) {
                ...NoteFields
                action {
                    id
                }
            }
        }
        ${NOTE_FIELDS_FRAGMENT}
    `

    const [createNoteApolloFunc, { loading, data, error }] = useMutation(CREATE_NOTE, {
        update(cache, { data: { createNote: note } }) {
            const actionId: string = note.action.id
            const actionFragmentId: string = `Action:${actionId}`
            const oldAction: Action | null = cache.readFragment({
                id: actionFragmentId,
                fragmentName: 'ActionNotes',
                fragment: ACTION_NOTES_FRAGMENT,
            })
            const newData = {
                notes: [...oldAction!.notes.filter(n => n.id !== note.id), note],
            }
            cache.writeFragment({
                id: actionFragmentId,
                data: newData,
                fragmentName: 'ActionNotes',
                fragment: ACTION_NOTES_FRAGMENT,
            })
        },
    })

    const createNote = (actionId: string, text: string) => {
        createNoteApolloFunc({ variables: { actionId, text } })
    }

    return {
        createNote,
        loading,
        note: data?.createNote,
        error,
    }
}

interface CreateClosingRemarkMutationProps {
    createClosingRemark: (actionId: string, text: string) => void
    loading: boolean
    closingRemark: ClosingRemark | undefined
    error: ApolloError | undefined
}

export const useCreateClosingRemarkMutation = (): CreateClosingRemarkMutationProps => {
    const CREATE_CLOSING_REMARK = gql`
        mutation CreateClosingRemark($text: String, $actionId: String) {
            createClosingRemark(text: $text, actionId: $actionId) {
                ...ClosingRemarkFields
                action {
                    id
                }
            }
        }
        ${CLOSING_REMARK_FIELDS_FRAGMENT}
    `

    const [createClosingRemarkApolloFunc, { loading, data, error }] = useMutation(CREATE_CLOSING_REMARK, {
        update(cache, { data: { createClosingRemark: closingRemark } }) {
            const actionId: string = closingRemark.action.id
            const actionFragmentId: string = `Action:${actionId}`
            const oldAction: Action | null = cache.readFragment({
                id: actionFragmentId,
                fragmentName: 'ActionClosingRemarks',
                fragment: ACTION_CLOSING_REMARKS_FRAGMENT,
            })
            const newData = {
                closingRemarks: [...oldAction!.closingRemarks.filter(cr => cr.id !== closingRemark.id), closingRemark],
            }
            cache.writeFragment({
                id: actionFragmentId,
                data: newData,
                fragmentName: 'ActionClosingRemarks',
                fragment: ACTION_CLOSING_REMARKS_FRAGMENT,
            })
        },
    })

    const createClosingRemark = (actionId: string, text: string) => {
        createClosingRemarkApolloFunc({ variables: { actionId, text } })
    }

    return {
        createClosingRemark,
        loading,
        closingRemark: data?.createClosingRemark,
        error,
    }
}
