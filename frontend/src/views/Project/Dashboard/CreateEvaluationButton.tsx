import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import { Button, SearchableDropdownOption, TextArea } from '@equinor/fusion-components'
import CreateEvaluationDialog from './CreateEvaluationDialog'
import { useCreateEvaluationMutation, useGetAllEvaluationsQuery } from './ProjectDashboardGQL'
import { useProject } from '../../../globals/contexts'

interface CreateEvaluationButtonProps {
    projectId: string
}

const CreateEvaluationButton = ({ projectId }: CreateEvaluationButtonProps) => {
    const project = useProject()
    const [showDialog, setShowDialog] = useState<boolean>(false)

    const onCreateEvaluationDialogSureClick = (
        name: string,
        previousEvaluationId?: string
    ) => {
        setShowDialog(false)
        createEvaluation(name, projectId, previousEvaluationId)
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
                    value={JSON.stringify(errorMutation)}
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
