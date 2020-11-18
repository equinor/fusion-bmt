import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import { Button, TextArea } from '@equinor/fusion-components'
import CreateEvaluationDialog from './CreateEvaluationDialog'
import { useCurrentUser } from '@equinor/fusion'
import { useCreateEvaluationMutation } from './ProjectDashboardGQL'

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
