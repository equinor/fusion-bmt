import { ApolloError, gql, useMutation } from '@apollo/client'

import { ACTION_FIELDS_FRAGMENT, NOTE_FIELDS_FRAGMENT, ACTION_NOTES_FRAGMENT } from './fragments'
import { Action, Note, Priority, Question } from './models'

export interface DataToCreateAction {
    questionId: string
    assignedToId: string
    description: string
    dueDate: Date
    priority: Priority
    title: string
}

interface CreateActionMutationProps {
    createAction: (data: DataToCreateAction) => void
    loading: boolean
    action: Action | undefined
    error: ApolloError | undefined
}

export const useCreateActionMutation = (): CreateActionMutationProps => {
    const CREATE_ACTION = gql`
        mutation CreateAction(
            $questionId: String
            $assignedToId: String
            $description: String
            $dueDate: DateTime!
            $priority: Priority!
            $title: String
        ) {
            createAction(
                questionId: $questionId
                assignedToId: $assignedToId
                description: $description
                dueDate: $dueDate
                priority: $priority
                title: $title
            ) {
                ...ActionFields
                question {
                    id
                }
            }
        }
        ${ACTION_FIELDS_FRAGMENT}
    `

    const QUESTION_ACTIONS_FRAGMENT = gql`
        fragment QuestionActions on Question {
            actions {
                ...ActionFields
                notes {
                    id
                }
            }
        }
        ${ACTION_FIELDS_FRAGMENT}
    `

    const [createActionApolloFunc, { loading, data, error }] = useMutation(CREATE_ACTION, {
        update(cache, { data: { createAction: action } }) {
            const questionId: string = action.question.id
            const questionFragmentId: string = `Question:${questionId}`
            const oldFragment: Question | null = cache.readFragment({
                id: questionFragmentId,
                fragmentName: 'QuestionActions',
                fragment: QUESTION_ACTIONS_FRAGMENT,
            })
            const newData = {
                actions: [...oldFragment!.actions.filter(a => a.id !== action.id), { ...action, notes: [] }],
            }
            cache.writeFragment({
                id: questionFragmentId,
                data: newData,
                fragmentName: 'QuestionActions',
                fragment: QUESTION_ACTIONS_FRAGMENT,
            })
        },
    })

    const createAction = (data: DataToCreateAction) => {
        createActionApolloFunc({ variables: { ...data } })
    }

    return {
        createAction: createAction,
        loading,
        action: data?.createAction,
        error,
    }
}

interface EditActionMutationProps {
    editAction: (action: Action) => void
    loading: boolean
    action: Action | undefined
    error: ApolloError | undefined
}

export const useEditActionMutation = (): EditActionMutationProps => {
    const EDIT_ACTION = gql`
        mutation EditAction(
            $actionId: String
            $assignedToId: String
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
        editActionApolloFunc({ variables: { ...action, actionId: action.id, assignedToId: action.assignedTo!.id } })
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

export const useCreateNoteMutation = (): CreateNoteMutationProps => {
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
