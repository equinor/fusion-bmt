import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import { Button, TextArea } from '@equinor/fusion-components'
import { ApolloError, gql, useMutation } from '@apollo/client'
import CreateEvaluationDialog from './CreateEvaluationDialog'
import { useCurrentUser } from '@equinor/fusion'
import { Evaluation } from '../../../api/models'

interface CreateEvaluationMutationProps {
    createEvaluation: (azureUniqueId: string, name: string, projectId: string) => void
    loading: boolean
    evaluation: Evaluation | undefined
    error: ApolloError | undefined
}

const useCreateEvaluationMutation = (): CreateEvaluationMutationProps => {
    const ADD_PROJECT = gql`
        mutation CreateEvaluation($azureUniqueId: String!, $name: String!, $projectId: String!){
            createEvaluation(
                azureUniqueId: $azureUniqueId
                name: $name
                projectId: $projectId
            ){
                id
                createDate
                name
                projectId
            }
        }
    `

    const [createEvaluationApolloFunc, { loading, data, error }] = useMutation(
        ADD_PROJECT, {
            update(cache, { data: { createEvaluation } }) {
                cache.modify({
                    fields: {
                        evaluations(existingEvaluations = []) {
                            const newEvaluationRef = cache.writeFragment({
                                id: createEvaluation.id,
                                data: createEvaluation,
                                fragment: gql`
                                fragment NewEvaluation on Evaluation {
                                    id
                                    createDate
                                    name
                                    projectId
                                }
                                `
                            })
                            return [...existingEvaluations, newEvaluationRef]
                        }
                    }
                })
            }
        }
    )

    const createEvaluation = (azureUniqueId: string, name: string, projectId: string) => {
        createEvaluationApolloFunc({ variables: { azureUniqueId, name, projectId } })
    }

    return {
        createEvaluation,
        loading,
        evaluation: data?.createEvaluation,
        error
    }
}

interface CreateEvaluationButtonProps {
    projectId: string
}

const CreateEvaluationButton = ({projectId}: CreateEvaluationButtonProps) => {
    const user = useCurrentUser()
    const azureUniqueId: string = user?.id as string
    const [showDialog, setShowDialog] = useState<boolean>(false)
    const {createEvaluation, loading, evaluation, error} = useCreateEvaluationMutation()

    const pathname = window.location.pathname

    const onCreateEvaluationDialogSureClick = (name: string) => {
        setShowDialog(false)
        createEvaluation(azureUniqueId, name, projectId)
    }
    const onCreateEvaluationDialogCancelClick = () => {
        setShowDialog(false)
    }
    const onCreateEvaluationButtonClick = () => {
        setShowDialog(true)
    }

    if (error !== undefined) {
        return <div>
            <TextArea
                value={JSON.stringify(error)}
                onChange={() => { }}
            />
        </div>
    }

    if(evaluation === undefined){
        return <>
            <Button
                onClick={onCreateEvaluationButtonClick}
                disabled={loading}
            >
                Create evaluation
            </Button>

            {showDialog &&
                <CreateEvaluationDialog
                    open={showDialog}
                    onCreate={onCreateEvaluationDialogSureClick}
                    onCancelClick={onCreateEvaluationDialogCancelClick}
                />
            }
        </>
    }

    return <>
        <Redirect push to={`${pathname}/evaluation/${evaluation.id}`} />
    </>
}

export default CreateEvaluationButton
