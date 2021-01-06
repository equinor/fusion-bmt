import { ApolloError, gql, useMutation } from "@apollo/client"

import { ACTION_FIELDS_FRAGMENT, QUESTION_ACTIONS_FRAGMENT } from "./fragments"
import { Action, Priority, Question } from "./models"

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
            $questionId: String,
            $assignedToId: String,
            $description: String,
            $dueDate: DateTime!,
            $priority: Priority!,
            $title: String
        ) {
            createAction(
                questionId: $questionId,
                assignedToId: $assignedToId,
                description: $description,
                dueDate: $dueDate,
                priority: $priority,
                title: $title
            ){
                ...ActionFields
                question {
                    id
                }
            }
        }
        ${ACTION_FIELDS_FRAGMENT}
    `

    const [createActionApolloFunc, { loading, data, error }] = useMutation(
        CREATE_ACTION, {
            update(cache, { data: { createAction: action } }) {
                const questionId: string = action.question.id
                const questionFragmentId: string = `Question:${questionId}`
                const oldFragment: Question | null = cache.readFragment({
                    id: questionFragmentId,
                    fragmentName: 'QuestionActions',
                    fragment: QUESTION_ACTIONS_FRAGMENT
                })
                const newData = {
                    actions: [...oldFragment!.actions.filter(a => a.id !== action.id), action]
                }
                cache.writeFragment({
                    id: questionFragmentId,
                    data: newData,
                    fragmentName: 'QuestionActions',
                    fragment: QUESTION_ACTIONS_FRAGMENT
                })
            },

        }
    )

    const createAction = (data: DataToCreateAction) => {
        createActionApolloFunc({ variables: { ...data } })
    }

    return {
        createAction: createAction,
        loading,
        action: data?.createAction,
        error
    }
}
