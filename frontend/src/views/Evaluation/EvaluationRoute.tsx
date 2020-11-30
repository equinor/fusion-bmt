import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'

import { TextArea } from '@equinor/fusion-components'

import { Participant } from '../../api/models'
import { useEvaluationQuery, useParticipantQuery, useProgressEvaluationMutation } from './EvaluationGQL'
import { createContext, useState } from 'react'
import ProgressEvaluationDialog from '../../components/ProgressEvaluationDialog'
import EvaluationView from './EvaluationView'

export const CurrentParticipantContext = createContext<Participant | undefined>(undefined)

interface Params {
    fusionProjectId: string
    evaluationId: string
}

const EvaluationRoute = ({match}: RouteComponentProps<Params>) => {
    const evaluationId: string = match.params.evaluationId

    const {loading: loadingParticipant, participant, error: errorLoadingParticipant} = useParticipantQuery(evaluationId)
    const {loading, evaluation, error: errorLoadingEvaluation} = useEvaluationQuery(evaluationId)
    const {progressEvaluation, error: errorProgressEvaluation} = useProgressEvaluationMutation()

    const [isProgressDialogOpen, setIsProgressDialogOpen] = useState<boolean>(false)

    const onConfirmProgressEvaluationClick = () => {
        progressEvaluation(evaluationId)
        setIsProgressDialogOpen(false)
    }
    const onCancelProgressEvaluation = () => {
        setIsProgressDialogOpen(false)
    }
    const onProgressEvaluationClick = () => {
        setIsProgressDialogOpen(true)
    }

    if(loading || loadingParticipant){
        return <>
            Loading...
        </>
    }

    if(errorLoadingEvaluation !== undefined){
        return <div>
            <TextArea
                value={`Error loading evaluation: ${JSON.stringify(errorLoadingEvaluation)}`}
                onChange={() => {}}
            />
        </div>
    }

    if(errorLoadingParticipant !== undefined){
        return <div>
            <TextArea
                value={`Error loading participant: ${JSON.stringify(errorLoadingParticipant)}`}
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

    return (
        <>
            <CurrentParticipantContext.Provider value={participant}>
                <EvaluationView
                    evaluation={evaluation}
                    onProgressEvaluationClick={onProgressEvaluationClick}
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
