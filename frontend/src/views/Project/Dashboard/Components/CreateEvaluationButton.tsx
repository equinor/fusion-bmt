import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import { ApolloError, gql, useMutation } from '@apollo/client'
import { Button } from '@equinor/fusion-components'

import { useProject } from '../../../../globals/contexts'
import { Evaluation } from '../../../../api/models'
import { EVALUATION_FIELDS_FRAGMENT } from '../../../../api/fragments'
import CreateEvaluationDialog from './CreateEvaluationDialog'
import { useEffectNotOnMount } from '../../../../utils/hooks'
import { useCurrentUser } from '@equinor/fusion'
import { getCachedRoles } from "../../../../utils/helpers"

interface CreateEvaluationButtonProps {
    projectId: string
}

const CreateEvaluationButton = ({ projectId }: CreateEvaluationButtonProps) => {
    const currentUser = useCurrentUser()
    const project = useProject()
    const [showDialog, setShowDialog] = useState<boolean>(false)
    const { createEvaluation, loading: creatingEvaluation, evaluation, error: createEvaluationError } = useCreateEvaluationMutation()
    const canCreateEvaluation = currentUser && getCachedRoles().includes('Role.Facilitator')

    useEffectNotOnMount(() => {
        if (!creatingEvaluation && evaluation !== undefined) {
            setShowDialog(false)
        }
    }, [creatingEvaluation])

    const onCreateEvaluationClick = (name: string, projectCategoryId: string, previousEvaluationId?: string) => {
        createEvaluation(name, projectId, projectCategoryId, previousEvaluationId)
    }

    const onCreateEvaluationCancelClick = () => {
        setShowDialog(false)
    }

    const onCreateEvaluationButtonClick = () => {
        setShowDialog(true)
    }

    if (evaluation === undefined) {
        return (
            <>
                {canCreateEvaluation && (
                    <div style={{ marginRight: 20 }}>
                        <Button onClick={onCreateEvaluationButtonClick} disabled={creatingEvaluation}>
                            Create evaluation
                        </Button>
                    </div>
                )}
                {showDialog && (
                    <CreateEvaluationDialog
                        open={showDialog}
                        onCreate={onCreateEvaluationClick}
                        onCancelClick={onCreateEvaluationCancelClick}
                        creatingEvaluation={creatingEvaluation}
                        createEvaluationError={createEvaluationError}
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
        mutation CreateEvaluation($name: String!, $projectId: String!, $previousEvaluationId: String, $projectCategoryId: String!) {
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

    const createEvaluation = (name: string, projectId: string, projectCategoryId: string, previousEvaluationId?: string) => {
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
