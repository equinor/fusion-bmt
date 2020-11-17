import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'

import { Stepper, Step, TextArea } from '@equinor/fusion-components'
import { ApolloError, gql, useQuery } from '@apollo/client'

import NominationView from '../views/Evaluation/Nomination/NominationView'
import { Evaluation, Progression } from '../api/models'
import PreparationView from '../views/Evaluation/Preparation/PreparationView'
import { EVALUATION_FIELDS_FRAGMENT } from '../api/fragments'
import { useProgressEvaluationMutation } from './EvaluationGQL'
import { calcProgressionStatus } from '../utils/ProgressionStatus'

interface EvaluationQueryProps {
    loading: boolean
    evaluation: Evaluation | undefined
    error: ApolloError | undefined
}

const useEvaluationQuery = (evaluationId: string): EvaluationQueryProps => {
    const GET_EVALUATION = gql`
        query {
            evaluations(where:{id: {eq: "${evaluationId}"}}) {
                ...EvaluationFields
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{evaluations: Evaluation[]}>(
        GET_EVALUATION
    )

    return {
        loading,
        evaluation: data?.evaluations.find(evaluation => evaluation.id === evaluationId),
        error
    }
}

interface Params {
    fusionProjectId: string
    evaluationId: string
}

const EvaluationRoute = ({match}: RouteComponentProps<Params>) => {
    const evaluationId: string = match.params.evaluationId

    const {loading, evaluation, error} = useEvaluationQuery(evaluationId)
    const {progressEvaluation, error: errorProgressEvaluation} = useProgressEvaluationMutation()

    const onProgressEvaluationClick = () => {
        progressEvaluation(evaluationId)
    }

    if(loading){
        return <>
            Loading...
        </>
    }

    if(error !== undefined){
        return <div>
            <TextArea
                value={JSON.stringify(error)}
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
            <Stepper
                forceOrder={false}
                activeStepKey={evaluation.progression}
                hideNavButtons={true}
            >
                <Step
                    title="Nomination"
                    description={calcProgressionStatus(evaluation.progression, Progression.Nomination)}
                    stepKey={Progression.Nomination}
                >
                    <NominationView
                        evaluation={evaluation}
                        onNextStep={() => onProgressEvaluationClick()}
                    />
                </Step>
                <Step
                    title="Preparation"
                    description={calcProgressionStatus(evaluation.progression, Progression.Preparation)}
                    stepKey={Progression.Preparation}
                >
                    <>
                        <PreparationView evaluation={evaluation}/>
                    </>
                </Step>
                <Step
                    title="Alignment"
                    description={calcProgressionStatus(evaluation.progression, Progression.Alignment)}
                    stepKey={Progression.Alignment}
                >
                    <h1>Alignment</h1>
                </Step>
                <Step
                    title="Workshop"
                    description={calcProgressionStatus(evaluation.progression, Progression.Workshop)}
                    stepKey={Progression.Workshop}
                >
                    <h1>Workshop</h1>
                </Step>
                <Step
                    title="Follow-up"
                    description={calcProgressionStatus(evaluation.progression, Progression.FollowUp)}
                    stepKey={Progression.FollowUp}
                >
                    <h1>Follow-up</h1>
                </Step>
            </Stepper>
        </>
    )
}

export default EvaluationRoute
