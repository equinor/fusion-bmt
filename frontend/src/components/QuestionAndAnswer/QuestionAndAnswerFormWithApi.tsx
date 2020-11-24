import { ApolloError, gql, useQuery } from '@apollo/client'
import { TextArea } from '@equinor/fusion-components'
import React from 'react'
import { ANSWER_FIELDS_FRAGMENT } from '../../api/fragments'

import { Answer, Organization, Participant, Progression, Question, Role, Severity } from '../../api/models'
import { getAzureUniqueId } from '../../utils/Variables'
import QuestionAndAnswerForm from './QuestionAndAnswerForm'

interface AnswerQueryProps {
    loading: boolean
    answer: Answer | undefined
    error: ApolloError | undefined
}

export const useAnswerQuery = (questionId: string, azureUniqueId: string): AnswerQueryProps => {
    const GET_ANSWER = gql`
        query {
            answers(where: {and: [
                {question: {id: {eq: "${questionId}"}}},
                {answeredBy: {azureUniqueId: {eq: "${azureUniqueId}"}}}
            ]}){
                ...AnswerFields
            }
        }
        ${ANSWER_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{answer: Answer}>(
        GET_ANSWER
    )

    return {
        loading,
        answer: data?.answer,
        error
    }
}

interface QuestionAndAnswerFormWithApiProps {
    questionNumber: number
    question: Question
}

const QuestionAndAnswerFormWithApi = ({questionNumber, question}: QuestionAndAnswerFormWithApiProps) => {
    const azureUniqueId = getAzureUniqueId()
    const {loading: loadingAnswer, answer, error: errorLoadingAnswer} = useAnswerQuery(question.id, azureUniqueId)

    const emptyAnswer: Answer = {
        id: "",
        progression: Progression.Nomination,
        severity: Severity.Na,
        text: "",
        createDate: "",
        question: question
    }

    if(errorLoadingAnswer !== undefined){
        return <div>
            <TextArea
                value={`Error loading answer: ${JSON.stringify(errorLoadingAnswer)}`}
                onChange={() => { }}
            />
        </div>
    }

    if(loadingAnswer){
        return <>Loading ...</>
    }

    return <>
        <QuestionAndAnswerForm
            questionNumber={questionNumber}
            question={question}
            answer={answer ?? emptyAnswer}
            onAnswerChange={(answer) => {}}
        />
    </>
}

export default QuestionAndAnswerFormWithApi
