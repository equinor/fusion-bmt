import { ApolloError, gql, useMutation, useQuery } from '@apollo/client'
import { ANSWER_FIELDS_FRAGMENT, EVALUATION_FIELDS_FRAGMENT, PARTICIPANTS_ARRAY_FRAGMENT, PARTICIPANT_FIELDS_FRAGMENT, QUESTION_FIELDS_FRAGMENT } from '../../api/fragments'
import { Evaluation, Participant, Progression } from '../../api/models'

interface ProgressEvaluationMutationProps {
    progressEvaluation: (evaluationId: string, newProgression: Progression) => void
    loading: boolean
    evaluation: Evaluation | undefined
    error: ApolloError | undefined
}

export const useProgressEvaluationMutation = (): ProgressEvaluationMutationProps => {
    const PROGRESS_EVALUATION = gql`
        mutation ProgessEvaluation($evaluationId: String!, $newProgression: Progression!) {
            progressEvaluation(evaluationId: $evaluationId, newProgression: $newProgression){
                ...EvaluationFields
                ...ParticipantsArray
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
        ${PARTICIPANTS_ARRAY_FRAGMENT}
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

    const progressEvaluation = (evaluationId: string, newProgression: Progression) => {
        progressEvaluationApolloFunc({ variables: { evaluationId, newProgression } })
    }

    return {
        progressEvaluation: progressEvaluation,
        loading,
        evaluation: data?.progressEvaluation,
        error
    }
}

interface ProgressParticipantMutationProps {
    progressParticipant: (evaluationId: string, newProgression: Progression) => void
    loading: boolean
    participant: Participant | undefined
    error: ApolloError | undefined
}

export const useProgressParticipantMutation = (): ProgressParticipantMutationProps => {
    const PROGRESS_PARTICIPANT = gql`
        mutation ProgressParticipant($evaluationId: String!, $newProgression: Progression!){
            progressParticipant(
                evaluationId: $evaluationId,
                newProgression: $newProgression
            ){
                ...ParticipantFields
            }
        }
        ${PARTICIPANT_FIELDS_FRAGMENT}
    `

    const [progressParticipantApolloFunc, { loading, data, error }] = useMutation(
        PROGRESS_PARTICIPANT, {
            update(cache, { data: { progressParticipant } }) {
                cache.writeFragment({
                    data: progressParticipant,
                    fragment: PARTICIPANT_FIELDS_FRAGMENT
                })
            }
        }
    )

    const progressParticipant = (evaluationId: string, newProgression: Progression) => {
        progressParticipantApolloFunc({ variables: { evaluationId, newProgression } })
    }

    return {
        progressParticipant: progressParticipant,
        loading,
        participant: data?.progressParticipant,
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
                ...ParticipantsArray
                questions {
                    ...QuestionFields
                    answers {
                        ...AnswerFields
                    }
                }
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
        ${PARTICIPANTS_ARRAY_FRAGMENT}
        ${QUESTION_FIELDS_FRAGMENT}
        ${ANSWER_FIELDS_FRAGMENT}
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
