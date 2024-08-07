import React, { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom'

import { ApolloError, gql, useMutation } from '@apollo/client'
import { Button } from '@equinor/eds-core-react'

import { useProject } from '../../../../globals/contexts'
import { Evaluation } from '../../../../api/models'
import { EVALUATION_FIELDS_FRAGMENT } from '../../../../api/fragments'
import CreateEvaluationDialog from './CreateEvaluationDialog'
import { useEffectNotOnMount } from '../../../../utils/hooks'
import { getCachedRoles } from "../../../../utils/helpers"
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks'
import { useAppContext } from '../../../../context/AppContext'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'

const CreateEvaluationButton = () => {
    const currentUser = useCurrentUser()
    const { currentContext } = useModuleCurrentContext()
    const { currentProject } = useAppContext()
    const [fusionProjectId, setFusionProjectId] = useState<string | undefined>(undefined)
    const [showDialog, setShowDialog] = useState<boolean>(false)
    const { createEvaluation, loading: creatingEvaluation, evaluation, error: createEvaluationError } = useCreateEvaluationMutation()
    // const canCreateEvaluation = currentUser && getCachedRoles()?.includes('Role.Facilitator')
    const canCreateEvaluation = true

    useEffect(() => {
        if (currentContext && currentContext.externalId) {
            setFusionProjectId(currentContext.externalId)
        } else if (currentProject) {
            setFusionProjectId(currentProject.id)
        }
    }, [currentContext, currentProject])
    

    useEffectNotOnMount(() => {
        if (!creatingEvaluation && evaluation !== undefined) {
            setShowDialog(false)
        }
    }, [creatingEvaluation])

    const onCreateEvaluationClick = (name: string, projectCategoryId: string, previousEvaluationId?: string) => {
        fusionProjectId && createEvaluation(name, fusionProjectId, projectCategoryId, previousEvaluationId)
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
                    <Button onClick={onCreateEvaluationButtonClick} disabled={creatingEvaluation}>
                        Create evaluation
                    </Button>
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
            <Redirect push to={`${fusionProjectId}/evaluation/${evaluation.id}`} />
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
