import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'

import { TextArea } from '@equinor/fusion-components'

import { Participant, Progression } from '../../api/models'
import { useEvaluationQuery, useProgressEvaluationMutation, useProgressParticipantMutation } from './EvaluationGQL'
import ProgressEvaluationDialog from '../../components/ProgressEvaluationDialog'
import EvaluationView from './EvaluationView'
import { useAzureUniqueId } from '../../utils/Variables'
import { getNextProgression } from '../../utils/ProgressionStatus'
import { CurrentParticipantContext, EvaluationContext } from '../../globals/contexts'
import { apiErrorMessage } from '../../api/error'

interface Params {
    fusionProjectId: string
    evaluationId: string
}

const EvaluationRoute = ({ match }: RouteComponentProps<Params>) => {
    const evaluationId: string = match.params.evaluationId
    const azureUniqueId = useAzureUniqueId()

    const { loading, evaluation, error: errorLoadingEvaluation } = useEvaluationQuery(evaluationId)
    const { progressEvaluation, error: errorProgressEvaluation } = useProgressEvaluationMutation()
    const { progressParticipant, error: errorProgressingParticipant } = useProgressParticipantMutation()

    const [isProgressDialogOpen, setIsProgressDialogOpen] = useState<boolean>(false)

    const onConfirmProgressEvaluationClick = () => {
        const newProgression = getNextProgression(evaluation!.progression)
        progressEvaluation(evaluationId, newProgression)
        setIsProgressDialogOpen(false)
    }
    const onCancelProgressEvaluation = () => {
        setIsProgressDialogOpen(false)
    }
    const onProgressEvaluationClick = () => {
        setIsProgressDialogOpen(true)
    }

    if (loading) {
        return <>Loading...</>
    }

    if (errorProgressingParticipant !== undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not progress participant')} onChange={() => {}} />
            </div>
        )
    }

    if (errorLoadingEvaluation !== undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not load evaluation')} onChange={() => {}} />
            </div>
        )
    }

    if (errorProgressEvaluation !== undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not progress evaluation')} onChange={() => {}} />
            </div>
        )
    }

    if (evaluation === undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Evaluation is undefined')} onChange={() => {}} />
            </div>
        )
    }

    const onProgressParticipant = (newProgressions: Progression) => {
        progressParticipant(evaluation.id, newProgressions)
    }

    const participant: Participant | undefined = evaluation.participants.find(p => p.azureUniqueId === azureUniqueId)

    return (
        <>
            <CurrentParticipantContext.Provider value={participant}>
                <EvaluationContext.Provider value={evaluation}>
                    <EvaluationView
                        evaluation={evaluation}
                        onProgressEvaluationClick={onProgressEvaluationClick}
                        onProgressParticipant={onProgressParticipant}
                    />
                    <ProgressEvaluationDialog
                        isOpen={isProgressDialogOpen}
                        currentProgression={evaluation.progression}
                        onConfirmClick={onConfirmProgressEvaluationClick}
                        onCancelClick={onCancelProgressEvaluation}
                    />
                </EvaluationContext.Provider>
            </CurrentParticipantContext.Provider>
        </>
    )
}

export default EvaluationRoute
