import { ApolloError, gql, useMutation, useQuery } from '@apollo/client'
import { EVALUATION_FIELDS_FRAGMENT, PARTICIPANT_FIELDS_FRAGMENT } from '../../../api/fragments'
import { Evaluation } from '../../../api/models'

interface EvaluationQueryProps {
    loading: boolean
    evaluations: Evaluation[] | undefined
    error: ApolloError | undefined
}

export const useEvaluationsQuery = (projectId: string, azureUniqueId: string): EvaluationQueryProps => {
    const GET_EVALUATIONS = gql`
        query($projectId: String!, $azureUniqueId: String!) {
            evaluations(
                where: {
                    and: [{ project: { id: { eq: $projectId } } }, { participants: { some: { azureUniqueId: { eq: $azureUniqueId } } } }]
                }
            ) {
                ...EvaluationFields
                participants {
                    ...ParticipantFields
                }
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
                    }
                }
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
        ${PARTICIPANT_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{ evaluations: Evaluation[] }>(GET_EVALUATIONS, {
        variables: {
            projectId,
            azureUniqueId,
        },
    })

    return {
        loading,
        evaluations: data?.evaluations,
        error,
    }
}

export const useUserEvaluationsQuery = (azureUniqueId: string): EvaluationQueryProps => {
    const GET_EVALUATIONS = gql`
        query($azureUniqueId: String!) {
            evaluations(where: { participants: { some: { azureUniqueId: { eq: $azureUniqueId } } } }) {
                id
                name
                progression
                createDate
                questions {
                    id
                    barrier
                    answers {
                        id
                        severity
                        progression
                    }
                    actions {
                        id
                        dueDate
                        completed
                    }
                }
            }
        }
    `

    const { loading, data, error } = useQuery<{ evaluations: Evaluation[] }>(GET_EVALUATIONS, { variables: { azureUniqueId } })

    return {
        loading,
        evaluations: data?.evaluations,
        error,
    }
}

export const useGetAllEvaluationsQuery = (projectId: string): EvaluationQueryProps => {
    const GET_EVALUATIONS = gql`
        query($projectId: String!) {
            evaluations(where: { project: { id: { eq: $projectId } } }) {
                id
                name
                progression
                createDate
                questions {
                    id
                    barrier
                    answers {
                        id
                        severity
                        progression
                    }
                    actions {
                        id
                        dueDate
                        completed
                    }
                }
            }
        }
    `

    const { loading, data, error } = useQuery<{ evaluations: Evaluation[] }>(GET_EVALUATIONS, { variables: { projectId } })

    return {
        loading,
        evaluations: data?.evaluations,
        error,
    }
}

interface CreateEvaluationMutationProps {
    createEvaluation: (name: string, projectId: string, previousEvaluationId?: string) => void
    loading: boolean
    evaluation: Evaluation | undefined
    error: ApolloError | undefined
}

export const useCreateEvaluationMutation = (): CreateEvaluationMutationProps => {
    const ADD_EVALUATION = gql`
        mutation CreateEvaluation($name: String!, $projectId: String!, $previousEvaluationId: String) {
            createEvaluation(name: $name, projectId: $projectId, previousEvaluationId: $previousEvaluationId) {
                ...EvaluationFields
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
    `

    const [createEvaluationApolloFunc, { loading, data, error }] = useMutation(ADD_EVALUATION, {
        update(cache, { data: { createEvaluation } }) {
            cache.modify({
                fields: {
                    evaluations(existingEvaluations = []) {
                        const newEvaluationRef = cache.writeFragment({
                            data: createEvaluation,
                            fragment: EVALUATION_FIELDS_FRAGMENT,
                        })
                        return [...existingEvaluations, newEvaluationRef]
                    },
                },
            })
        },
    })

    const createEvaluation = (name: string, projectId: string, previousEvaluationId?: string) => {
        createEvaluationApolloFunc({
            variables: { name, projectId, previousEvaluationId },
        })
    }

    return {
        createEvaluation,
        loading,
        evaluation: data?.createEvaluation,
        error,
    }
}
