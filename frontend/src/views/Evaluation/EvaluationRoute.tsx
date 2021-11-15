import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { ApolloError, gql, useApolloClient, useMutation, useQuery } from '@apollo/client'

import { TextArea } from '@equinor/fusion-components'
import { CircularProgress } from '@equinor/eds-core-react'
import styled from 'styled-components'

import { Evaluation, Participant, Progression } from '../../api/models'
import ProgressEvaluationDialog from '../../components/ProgressEvaluationDialog'
import EvaluationView from './EvaluationView'
import { useAzureUniqueId } from '../../utils/Variables'
import { getNextProgression } from '../../utils/ProgressionStatus'
import { CurrentParticipantContext, EvaluationContext } from '../../globals/contexts'
import { apiErrorMessage } from '../../api/error'
import {
    ACTION_FIELDS_FRAGMENT,
    ANSWER_FIELDS_FRAGMENT,
    EVALUATION_FIELDS_FRAGMENT,
    NOTE_FIELDS_FRAGMENT,
    PARTICIPANTS_ARRAY_FRAGMENT,
    PARTICIPANT_FIELDS_FRAGMENT,
    QUESTION_FIELDS_FRAGMENT,
    CLOSING_REMARK_FIELDS_FRAGMENT,
} from '../../api/fragments'

const Centered = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
`

interface Params {
    fusionProjectId: string
    evaluationId: string
}

const EvaluationRoute = ({ match }: RouteComponentProps<Params>) => {
    const evaluationId: string = match.params.evaluationId
    const azureUniqueId = useAzureUniqueId()

    const { loading, evaluation, error: errorLoadingEvaluation } = useEvaluationQuery(evaluationId)
    const { progressEvaluation, loading: loadingProgressEvaluation, error: errorProgressEvaluation } = useProgressEvaluationMutation()
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

    if (loadingProgressEvaluation) {
        return (
            <Centered>
                <CircularProgress />
            </Centered>
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

interface ProgressEvaluationMutationProps {
    progressEvaluation: (evaluationId: string, newProgression: Progression) => void
    loading: boolean
    evaluation: Evaluation | undefined
    error: ApolloError | undefined
}

const useProgressEvaluationMutation = (): ProgressEvaluationMutationProps => {
    const apolloClient = useApolloClient()

    const PROGRESS_EVALUATION = gql`
        mutation ProgressEvaluation($evaluationId: String!, $newProgression: Progression!) {
            progressEvaluation(evaluationId: $evaluationId, newProgression: $newProgression) {
                ...EvaluationFields
                ...ParticipantsArray
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
        ${PARTICIPANTS_ARRAY_FRAGMENT}
    `

    const [progressEvaluationApolloFunc, { loading, data, error }] = useMutation(PROGRESS_EVALUATION, {
        update(cache, { data: { progressEvaluation } }) {
            apolloClient.resetStore()
        },
    })

    const progressEvaluation = (evaluationId: string, newProgression: Progression) => {
        progressEvaluationApolloFunc({ variables: { evaluationId, newProgression } })
    }

    return {
        progressEvaluation: progressEvaluation,
        loading,
        evaluation: data?.progressEvaluation,
        error,
    }
}

interface ProgressParticipantMutationProps {
    progressParticipant: (evaluationId: string, newProgression: Progression) => void
    loading: boolean
    participant: Participant | undefined
    error: ApolloError | undefined
}

const useProgressParticipantMutation = (): ProgressParticipantMutationProps => {
    const PROGRESS_PARTICIPANT = gql`
        mutation ProgressParticipant($evaluationId: String!, $newProgression: Progression!) {
            progressParticipant(evaluationId: $evaluationId, newProgression: $newProgression) {
                ...ParticipantFields
            }
        }
        ${PARTICIPANT_FIELDS_FRAGMENT}
    `

    const [progressParticipantApolloFunc, { loading, data, error }] = useMutation(PROGRESS_PARTICIPANT, {
        update(cache, { data: { progressParticipant } }) {
            cache.writeFragment({
                data: progressParticipant,
                fragment: PARTICIPANT_FIELDS_FRAGMENT,
            })
        },
    })

    const progressParticipant = (evaluationId: string, newProgression: Progression) => {
        progressParticipantApolloFunc({ variables: { evaluationId, newProgression } })
    }

    return {
        progressParticipant: progressParticipant,
        loading,
        participant: data?.progressParticipant,
        error,
    }
}

interface EvaluationQueryProps {
    loading: boolean
    evaluation: Evaluation | undefined
    error: ApolloError | undefined
}

const useEvaluationQuery = (evaluationId: string): EvaluationQueryProps => {
    const GET_EVALUATION = gql`
        query($evaluationId: String!) {
            evaluations(where: { id: { eq: $evaluationId } }) {
                ...EvaluationFields
                ...ParticipantsArray
                questions {
                    ...QuestionFields
                    answers {
                        ...AnswerFields
                    }
                    evaluation {
                        ...EvaluationFields
                    }
                    actions {
                        ...ActionFields
                        notes {
                            ...NoteFields
                        }
                        closingRemarks {
                            ...ClosingRemarkFields
                        }
                    }
                }
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
        ${PARTICIPANTS_ARRAY_FRAGMENT}
        ${QUESTION_FIELDS_FRAGMENT}
        ${ANSWER_FIELDS_FRAGMENT}
        ${ACTION_FIELDS_FRAGMENT}
        ${NOTE_FIELDS_FRAGMENT}
        ${CLOSING_REMARK_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{ evaluations: Evaluation[] }>(GET_EVALUATION, {
        variables: { evaluationId },
    })

    return {
        loading,
        evaluation: data?.evaluations.find(evaluation => evaluation.id === evaluationId),
        error,
    }
}
