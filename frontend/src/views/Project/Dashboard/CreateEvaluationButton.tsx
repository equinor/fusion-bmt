import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import { Button, TextArea } from '@equinor/fusion-components'
import CreateEvaluationDialog from './CreateEvaluationDialog'
import { useCreateEvaluationMutation } from './ProjectDashboardGQL'
import { useProject } from '../../../globals/contexts'

interface CreateEvaluationButtonProps {
    projectId: string
}

const CreateEvaluationButton = ({projectId}: CreateEvaluationButtonProps) => {
    const [showDialog, setShowDialog] = useState<boolean>(false)
    const {createEvaluation, loading, evaluation, error} = useCreateEvaluationMutation()

    const project = useProject()

    const onCreateEvaluationDialogSureClick = (name: string) => {
        setShowDialog(false)
        createEvaluation(name, projectId)
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
        <Redirect push to={`${project.fusionProjectId}/evaluation/${evaluation.id}`} />
    </>
}

export default CreateEvaluationButton
