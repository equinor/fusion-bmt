import { useEffect, useState } from 'react'
import { ApolloError, gql, useMutation } from '@apollo/client'
import ActionCreateSidebar from './ActionCreateSidebar'
import { Action, Participant, Priority, Question } from '../../../api/models'
import { apiErrorMessage } from '../../../api/error'
import { ACTION_FIELDS_FRAGMENT, QUESTION_ACTIONS_FRAGMENT } from '../../../api/fragments'

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
            onClose={ () => {
                onClose()
                setError('')
            }}
            connectedQuestion={connectedQuestion}
            possibleAssignees={possibleAssignees}
            onActionCreate={createAction}
            apiError={error}
            disableCreate={loading}
        />
    )
}

export default ActionCreateSidebarWithApi

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

const useCreateActionMutation = (): CreateActionMutationProps => {
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
