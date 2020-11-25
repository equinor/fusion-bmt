import { ApolloError, gql, useQuery } from '@apollo/client'
import { ANSWER_FIELDS_FRAGMENT, QUESTION_FIELDS_FRAGMENT } from '../../../api/fragments'
import { Question } from '../../../api/models'

interface QuestionsQueryProps {
    loading: boolean
    questions: Question[] | undefined
    error: ApolloError | undefined
}

export const useQuestionsQuery = (evaluationId: string): QuestionsQueryProps => {
    const GET_QUESTIONS = gql`
        query {
            questions(where: {evaluation: {id: {eq: "${evaluationId}"}}}){
                ...QuestionFields
                answers {
                    ...AnswerFields
                    answeredBy {
                        id
                        azureUniqueId
                    }
                }
            }
        }
        ${QUESTION_FIELDS_FRAGMENT}
        ${ANSWER_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{questions: Question[]}>(
        GET_QUESTIONS
    )

    return {
        loading,
        questions: data?.questions,
        error
    }
}
