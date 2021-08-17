import { ApolloError, gql, useMutation } from '@apollo/client'
import { ACTION_CLOSING_REMARKS_FRAGMENT, CLOSING_REMARK_FIELDS_FRAGMENT } from '../../../api/fragments'
import { Action, ClosingRemark } from '../../../api/models'

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
