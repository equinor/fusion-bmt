import { ApolloError, gql, useQuery } from '@apollo/client'
import { TextArea } from '@equinor/fusion-components'
import { apiErrorMessage } from '../../api/error'

import { QUESTIONTEMPLATE_FIELDS_FRAGMENT } from '../../api/fragments'
import { Barrier, QuestionTemplate, Status } from '../../api/models'
import BarrierQuestionList from './BarrierQuestionList'

interface Props {
    barrier: Barrier
}

const QuestionListWithApi = ({ barrier }: Props) => {
    const { questions, loading, error } = useQuestionTemplatesQuery()

    if (loading) {
        return <>Loading...</>
    }

    if (error !== undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not load questions')} onChange={() => {}} />
            </div>
        )
    }

    if (questions === undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Questions are undefined')} onChange={() => {}} />
            </div>
        )
    }

    const barrierQuestions = questions.filter(q => q.barrier === barrier)

    return (
        <BarrierQuestionList barrierQuestions={barrierQuestions} />
    )
}

export default QuestionListWithApi

interface QuestionTemplatesQueryProps {
    loading: boolean
    questions: QuestionTemplate[] | undefined
    error: ApolloError | undefined
}

const useQuestionTemplatesQuery = (): QuestionTemplatesQueryProps => {
    const GET_QUESTIONTEMPLATES = gql`
        query { 
            questionTemplates (where: {status: {eq: ${Status.Active}} }) {
                ...QuestionTemplateFields
            }
        }
        ${QUESTIONTEMPLATE_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{ questionTemplates: QuestionTemplate[] }>(GET_QUESTIONTEMPLATES)

    return {
        loading,
        questions: data?.questionTemplates,
        error,
    }
}
