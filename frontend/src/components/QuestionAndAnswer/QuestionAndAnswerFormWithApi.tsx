import { ApolloError, gql, useMutation, useQuery } from '@apollo/client'
import { TextArea } from '@equinor/fusion-components'
import React from 'react'
import { ANSWER_FIELDS_FRAGMENT } from '../../api/fragments'

import { Answer, Progression, Question, Severity } from '../../api/models'
import { getAzureUniqueId } from '../../utils/Variables'
import QuestionAndAnswerForm from './QuestionAndAnswerForm'

interface SetAnswerMutationProps {
    setAnswer: (questionId: string, severity: Severity, text: string) => void
    loading: boolean
    answer: Answer | undefined
    error: ApolloError | undefined
}

export const useSetAnswerMutation = (): SetAnswerMutationProps => {
    const SET_ANSWER = gql`
        mutation SetAnswer(
            $questionId: String,
            $severity: Severity!,
            $text: String
        ) {
            setAnswer(
                questionId: $questionId,
                severity: $severity,
                text: $text
            ){
                ...AnswerFields
            }
        }
        ${ANSWER_FIELDS_FRAGMENT}
    `

    const [setAnswerApolloFunc, { loading, data, error }] = useMutation(
        SET_ANSWER, {
            update(cache, { data: { setAnswer } }) {
                cache.modify({
                    fields: {
                        answers(existingAnswers = []) {
                            const newAnswerRef = cache.writeFragment({
                                id: setAnswer.id,
                                data: setAnswer,
                                fragment: ANSWER_FIELDS_FRAGMENT
                            })
                            return [...existingAnswers, newAnswerRef]
                        }
                    }
                })
            }
        }
    )

    const setAnswer = (questionId: string, severity: Severity, text: string) => {
        setAnswerApolloFunc({ variables: { questionId, severity, text } })
    }

    return {
        setAnswer: setAnswer,
        loading,
        answer: data?.setAnswer,
        error
    }
}

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

    const { loading, data, error } = useQuery<{answers: Answer[]}>(
        GET_ANSWER
    )

    return {
        loading,
        answer: data?.answers[0],
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
    const {setAnswer, error: errorSettingAnswer} = useSetAnswerMutation()

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

    if(errorSettingAnswer !== undefined){
        return <div>
            <TextArea
                value={`Error setting answer: ${JSON.stringify(errorSettingAnswer)}`}
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
            onAnswerChange={(answer) => setAnswer(question.id, answer.severity, answer.text)}
        />
    </>
}

export default QuestionAndAnswerFormWithApi
