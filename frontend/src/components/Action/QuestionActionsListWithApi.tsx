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
    const { cancelAction, loading, error: errorDeletingAction } = useCancelActionMutation()

    return (
        <>
            <QuestionActionsList
                question={question}
                participants={evaluation.participants}
                cancelAction={cancelAction}
                errorDeletingAction={errorDeletingAction}
                cancelActionLoading={loading}
            />
        </>
    )
}

export default QuestionActionsListWithApi

interface CancelActionMutationProps {
    cancelAction: (actionId: string) => void
    loading: boolean
    action: Action | undefined
    error: ApolloError | undefined
}

const useCancelActionMutation = (): CancelActionMutationProps => {
    const VOID_ACTION = gql`
        mutation VoidAction($actionId: String) {
            voidAction(actionId: $actionId) {
                id
                isVoided
            }
        }
    `
    const [cancelActionApolloFunc, { loading, data, error }] = useMutation(VOID_ACTION)

    const cancelAction = (actionId: string) => {
        cancelActionApolloFunc({ variables: { actionId } })
    }

    return {
        cancelAction,
        loading,
        action: data?.voidAction,
        error,
    }
}
