import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'

import { Stepper, Step, TextArea } from '@equinor/fusion-components'
import { ApolloError, gql, useQuery } from '@apollo/client'

import NominationView from '../views/Evaluation/Nomination/NominationView'
import { Evaluation, Progression } from '../api/models'
import PreparationView from '../views/Evaluation/Preparation/PreparationView'

interface EvaluationQueryProps {
    loading: boolean
    evaluation: Evaluation | undefined
    error: ApolloError | undefined
}

const useEvaluationQuery = (evaluationId: string): EvaluationQueryProps => {
    const GET_EVALUATION = gql`
        query {
            evaluations(where:{id: {eq: "${evaluationId}"}}) {
                id
                name
                progression
            }
        }
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

    const [currentStep, setCurrentStep] = React.useState<Progression>(Progression.Nomination)
    const {loading, evaluation, error} = useEvaluationQuery(evaluationId)

    if(loading){
        return <>
            Loading...
        </>
    }

    if(error !== undefined || evaluation === undefined){
        return <div>
            <TextArea
                value={JSON.stringify(error)}
                onChange={() => {}}
            />
        </div>
    }

    return (
        <>
            <Stepper
                forceOrder={false}
                activeStepKey={currentStep}
                hideNavButtons={true}
            >
                <Step
                    title="Nomination"
                    description="In progress"
                    stepKey={Progression.Nomination}
                >
                    <NominationView
                        evaluation={evaluation}
                        onNextStep={() => setCurrentStep(Progression.Preparation)}
                    />
                </Step>
                <Step
                    title="Preparation"
                    description=""
                    stepKey={Progression.Preparation}
                >
                    <>
                        <PreparationView evaluation={evaluation}/>
                    </>
                </Step>
                <Step
                    title="Alignment"
                    description=""
                    stepKey={Progression.Alignment}
                >
                    <h1>Alignment</h1>
                </Step>
                <Step
                    title="Workshop"
                    description=""
                    stepKey={Progression.Workshop}
                >
                    <h1>Workshop</h1>
                </Step>
                <Step
                    title="Follow-up"
                    description=""
                    stepKey={Progression.FollowUp}
                >
                    <h1>Follow-up</h1>
                </Step>
            </Stepper>
        </>
    )
}

export default EvaluationRoute
