import { ApolloError, gql, useMutation, useQuery } from '@apollo/client'
import { EVALUATION_FIELDS_FRAGMENT, PARTICIPANT_FIELDS_FRAGMENT } from '../../api/fragments'
import { Evaluation, Participant } from '../../api/models'
import { getAzureUniqueId } from '../../utils/Variables'

interface ProgressEvaluationMutationProps {
    progressEvaluation: (evaluationId: string) => void
    loading: boolean
    evaluation: Evaluation | undefined
    error: ApolloError | undefined
}

export const useProgressEvaluationMutation = (): ProgressEvaluationMutationProps => {
    const PROGRESS_EVALUATION = gql`
        mutation ProgessEvaluation($evaluationId: String!) {
            progressEvaluation(evaluationId: $evaluationId){
                ...EvaluationFields
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
    `

    const [progressEvaluationApolloFunc, { loading, data, error }] = useMutation(
        PROGRESS_EVALUATION, {
            update(cache, { data: { progressEvaluation } }) {
                cache.modify({
                    fields: {
                        evaluations(existingEvaluations = []) {
                            cache.writeFragment({
                                data: progressEvaluation,
                                fragment: EVALUATION_FIELDS_FRAGMENT
                            })
                            return existingEvaluations
                        }
                    }
                })
            }
        }
    )

    const progressEvaluation = (evaluationId: string) => {
        progressEvaluationApolloFunc({ variables: { evaluationId } })
    }

    return {
        progressEvaluation: progressEvaluation,
        loading,
        evaluation: data?.progressEvaluation,
        error
    }
}

interface EvaluationQueryProps {
    loading: boolean
    evaluation: Evaluation | undefined
    error: ApolloError | undefined
}

export const useEvaluationQuery = (evaluationId: string): EvaluationQueryProps => {
    const GET_EVALUATION = gql`
        query($evaluationId: String!) {
            evaluations(where:{id: {eq: $evaluationId}}) {
                ...EvaluationFields
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{evaluations: Evaluation[]}>(
        GET_EVALUATION,
        {
            variables: { evaluationId }
        }
    )

    return {
        loading,
        evaluation: data?.evaluations.find(evaluation => evaluation.id === evaluationId),
        error
    }
}

interface ParticipantQueryProps {
    loading: boolean
    participant: Participant | undefined
    error: ApolloError | undefined
}

export const useParticipantQuery = (evaluationId: string): ParticipantQueryProps => {
    const azureUniqueId = getAzureUniqueId()

    const GET_PARTICIPANT = gql`
        query($evaluationId: String!, $azureUniqueId: String!) {
            participants(where:{
                evaluation: {id: {eq: $evaluationId}},
                azureUniqueId: {eq: $azureUniqueId}
            }) {
                ...ParticipantFields
            }
        }
        ${PARTICIPANT_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{participants: Participant[]}>(
        GET_PARTICIPANT,
        {
            variables: { evaluationId, azureUniqueId }
        }
    )

    return {
        loading,
        participant: data?.participants.find(p => p.azureUniqueId === azureUniqueId),
        error
    }
}
