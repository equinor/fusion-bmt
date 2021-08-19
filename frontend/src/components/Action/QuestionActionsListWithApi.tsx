import { ApolloError, gql, useMutation } from '@apollo/client'
import React from 'react'

import { Action, Question } from '../../api/models'
import { useEvaluation } from '../../globals/contexts'
import QuestionActionsList from './QuestionActionsList'

interface Props {
    question: Question
}

const QuestionActionsListWithApi = ({ question }: Props) => {
    const evaluation = useEvaluation()
    const { deleteAction, error: errorDeletingAction } = useDeleteActionMutation(question.id)

    return (
        <>
            <QuestionActionsList
                question={question}
                participants={evaluation.participants}
                deleteAction={deleteAction}
                errorDeletingAction={errorDeletingAction}
            />
        </>
    )
}

export default QuestionActionsListWithApi

interface DeleteActionMutationProps {
    deleteAction: (actionId: string) => void
    loading: boolean
    action: Action | undefined
    error: ApolloError | undefined
}

/**
 * Removes the action from view.
 * Note that cache update is configured to only deal with situation where
 * action is loaded via question.
 *
 * @param questionId Id of question action is assigned to
 */
const useDeleteActionMutation = (questionId: string): DeleteActionMutationProps => {
    const DELETE_ACTION = gql`
        mutation DeleteAction($actionId: String) {
            deleteAction(actionId: $actionId) {
                id
            }
        }
    `
    const [deleteActionApolloFunc, { loading, data, error }] = useMutation(DELETE_ACTION, {
        update(cache, mutationResult) {
            const deleteAction = mutationResult.data.deleteAction
            cache.modify({
                id: cache.identify({
                    __typename: 'Question',
                    id: questionId,
                }),
                fields: {
                    actions(existingActionRefs, { readField }) {
                        return existingActionRefs.filter((actionRef: any) => {
                            return deleteAction.id !== readField('id', actionRef)
                        })
                    },
                },
            })
        },
    })

    const deleteAction = (actionId: string) => {
        deleteActionApolloFunc({ variables: { actionId } })
    }

    return {
        deleteAction,
        loading,
        action: data?.deleteAction,
        error,
    }
}
