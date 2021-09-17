import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import { Button, SearchableDropdownOption, TextArea } from '@equinor/fusion-components'
import CreateEvaluationDialog from './CreateEvaluationDialog'
import { useProject } from '../../../globals/contexts'
import { apiErrorMessage } from '../../../api/error'
import { ApolloError, gql, useMutation } from '@apollo/client'
import { Evaluation } from '../../../api/models'
import { EVALUATION_FIELDS_FRAGMENT } from '../../../api/fragments'

interface CreateEvaluationButtonProps {
    projectId: string
}

const CreateEvaluationButton = ({ projectId }: CreateEvaluationButtonProps) => {
    const project = useProject()
    const [showDialog, setShowDialog] = useState<boolean>(false)

    const onCreateEvaluationDialogSureClick = (
        name: string,
        projectCategoryId: string,
        previousEvaluationId?: string
    ) => {
        setShowDialog(false)
        createEvaluation(name, projectId, projectCategoryId, previousEvaluationId)
    }

    const onCreateEvaluationDialogCancelClick = () => {
        setShowDialog(false)
    }

    const onCreateEvaluationButtonClick = () => {
        setShowDialog(true)
    }

    const {
        createEvaluation,
        loading: loadingMutation,
        evaluation,
        error: errorMutation
    } = useCreateEvaluationMutation()

    if (errorMutation !== undefined) {
        return (
            <div>
                <TextArea
                    value={apiErrorMessage('Could not create evaluation')}
                    onChange={() => {}}
                />
            </div>
        )
    }

    if (evaluation === undefined) {
        return (
            <>
                <Button
                    onClick={onCreateEvaluationButtonClick}
                    disabled={loadingMutation}
                >
                    Create evaluation
                </Button>

                {showDialog && (
                    <CreateEvaluationDialog
                        open={showDialog}
                        onCreate={onCreateEvaluationDialogSureClick}
                        onCancelClick={onCreateEvaluationDialogCancelClick}
                    />
                )}
            </>
        )
    }

    return (
        <>
            <Redirect push to={`${project.fusionProjectId}/evaluation/${evaluation.id}`} />
        </>
    )
}

export default CreateEvaluationButton

interface CreateEvaluationMutationProps {
    createEvaluation: (name: string, projectId: string, projectCategoryId: string, previousEvaluationId?: string) => void
    loading: boolean
    evaluation: Evaluation | undefined
    error: ApolloError | undefined
}

const useCreateEvaluationMutation = (): CreateEvaluationMutationProps => {
    const ADD_EVALUATION = gql`
        mutation CreateEvaluation(
            $name: String!
            $projectId: String!
            $previousEvaluationId: String
            $projectCategoryId: String!
        ) {
            createEvaluation(
                name: $name
                projectId: $projectId
                previousEvaluationId: $previousEvaluationId
                projectCategoryId: $projectCategoryId
            ) {
                ...EvaluationFields
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
    `

    const [createEvaluationApolloFunc, { loading, data, error }] = useMutation(ADD_EVALUATION, {
        update(cache, { data: { createEvaluation } }) {
            cache.modify({
                fields: {
                    evaluations(existingEvaluations = []) {
                        const newEvaluationRef = cache.writeFragment({
                            data: createEvaluation,
                            fragment: EVALUATION_FIELDS_FRAGMENT,
                        })
                        return [...existingEvaluations, newEvaluationRef]
                    },
                },
            })
        },
    })

    const createEvaluation = (
        name: string,
        projectId: string,
        projectCategoryId: string,
        previousEvaluationId?: string
    ) => {
        createEvaluationApolloFunc({
            variables: { name, projectId, previousEvaluationId, projectCategoryId },
        })
    }

    return {
        createEvaluation,
        loading,
        evaluation: data?.createEvaluation,
        error,
    }
}
