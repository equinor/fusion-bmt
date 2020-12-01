import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'

import { TextArea } from '@equinor/fusion-components'

import { Participant, Progression } from '../../api/models'
import { useEvaluationQuery, useProgressEvaluationMutation, useProgressParticipantMutation } from './EvaluationGQL'
import { createContext, useState } from 'react'
import ProgressEvaluationDialog from '../../components/ProgressEvaluationDialog'
import EvaluationView from './EvaluationView'
import { getAzureUniqueId } from '../../utils/Variables'
import { getNextProgression } from '../../utils/ProgressionStatus'

export const CurrentParticipantContext = createContext<Participant | undefined>(undefined)

interface Params {
    fusionProjectId: string
    evaluationId: string
}

const EvaluationRoute = ({match}: RouteComponentProps<Params>) => {
    const evaluationId: string = match.params.evaluationId
    const azureUniqueId = getAzureUniqueId()

    const {loading, evaluation, error: errorLoadingEvaluation} = useEvaluationQuery(evaluationId)
    const {progressEvaluation, error: errorProgressEvaluation} = useProgressEvaluationMutation()
    const {progressParticipant, error: errorProgressingParticipant} = useProgressParticipantMutation()

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

    if(loading){
        return <>
            Loading...
        </>
    }

    if(errorProgressingParticipant !== undefined){
        return <div>
            <TextArea
                value={`Error progressing participant: ${JSON.stringify(errorProgressingParticipant)}`}
                onChange={() => { }}
            />
        </div>
    }

    if(errorLoadingEvaluation !== undefined){
        return <div>
            <TextArea
                value={`Error loading evaluation: ${JSON.stringify(errorLoadingEvaluation)}`}
                onChange={() => {}}
            />
        </div>
    }

    if(errorProgressEvaluation !== undefined){
        return <div>
            <TextArea
                value={`Error progressing evaluation: ${JSON.stringify(errorProgressEvaluation)}`}
                onChange={() => {}}
            />
        </div>
    }

    if(evaluation === undefined){
        return <div>
            <TextArea
                value={`Error: evaluation is undefined`}
                onChange={() => {}}
            />
        </div>
    }

    const onProgressParticipant = (newProgressions: Progression) => {
        progressParticipant(evaluation.id, newProgressions)
    }

    const participant: Participant | undefined = evaluation.participants.find(p => p.azureUniqueId === azureUniqueId)

    return (
        <>
            <CurrentParticipantContext.Provider value={participant}>
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
            </CurrentParticipantContext.Provider>
        </>
    )
}

export default EvaluationRoute
