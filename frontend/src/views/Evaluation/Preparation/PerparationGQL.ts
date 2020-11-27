import { ApolloError, gql, useQuery } from '@apollo/client'
import { ANSWER_FIELDS_FRAGMENT, PARTICIPANT_FIELDS_FRAGMENT, QUESTION_FIELDS_FRAGMENT } from '../../../api/fragments'
import { Question } from '../../../api/models'

const GET_QUESTIONS = gql`
    query($evaluationId: String!) {
        questions(where: {evaluation: {id: {eq: $evaluationId}}}){
            ...QuestionFields
            answers {
                ...AnswerFields
            }
        }
    }
    ${QUESTION_FIELDS_FRAGMENT}
    ${ANSWER_FIELDS_FRAGMENT}
`

interface QuestionsQueryProps {
    loading: boolean
    questions: Question[] | undefined
    error: ApolloError | undefined
}

export const useQuestionsQuery = (evaluationId: string): QuestionsQueryProps => {


    const { loading, data, error } = useQuery<{questions: Question[]}>(
        GET_QUESTIONS,
        {
            variables: { evaluationId }
        }
    )

    return {
        loading,
        questions: data?.questions,
        error
    }
}
