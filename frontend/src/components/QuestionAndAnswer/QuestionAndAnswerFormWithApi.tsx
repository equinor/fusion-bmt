import { ApolloError, gql, useQuery, useMutation } from '@apollo/client'
import { TextArea } from '@equinor/fusion-components'
import React from 'react'
import { ANSWER_FIELDS_FRAGMENT, EVALUATION_FIELDS_FRAGMENT } from '../../api/fragments'

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



interface UpdateAnswerMutationProps {
    updateAnswer: (answerId: string, severity: Severity, text: string) => void
    loading: boolean
    answer: Answer | undefined
    error: ApolloError | undefined
}

export const useUpdateAnswerMutation = (): UpdateAnswerMutationProps => {
    const UPDATE_ANSWER = gql`
        mutation UpdateAnswer($answerId: String!, $severity: Severity!, $text: String!) {
            updateAnswer(answerId: $answerId, severity: $severity, text: $text){
                ...AnswerFields
            }
        }
        ${ANSWER_FIELDS_FRAGMENT}
    `

    const [updateAnswerApolloFunc, { loading, data, error }] = useMutation(
        UPDATE_ANSWER, {
            update(cache, { data: { updateAnswer } }) {
                cache.modify({
                    fields: {
                        answers(existingAnswers = []) {
                            cache.writeFragment({
                                data: updateAnswer,
                                fragment: ANSWER_FIELDS_FRAGMENT
                            })
                            return existingAnswers
                        }
                    }
                })
            }
        }
    )

    const updateAnswer = (answerId: string, severity: Severity, text: string) => {
        updateAnswerApolloFunc({ variables: { answerId, severity, text } })
    }

    return {
        updateAnswer: updateAnswer,
        loading,
        answer: data?.updateAnswer,
        error
    }
}


const emptyParticipant: Participant = {
    id: "",
    evaluationId: "",
    organization: Organization.All,
    azureUniqueId: "",
    role: Role.Facilitator,
    createDate: ""
}

const emptyAnswer: Answer = {
    id: "",
    questionId: "",
    progression: Progression.Nomination,
    severity: Severity.Na,
    text: "",
    createDate: "",
    answeredBy: emptyParticipant
}

interface QuestionAndAnswerFormWithApiProps {
    questionNumber: number
    question: Question
}

const QuestionAndAnswerFormWithApi = ({questionNumber, question}: QuestionAndAnswerFormWithApiProps) => {
    const azureUniqueId = getAzureUniqueId()
    const {loading: loadingAnswer, answer, error: errorLoadingAnswer} = useAnswerQuery(question.id, azureUniqueId)
    const {updateAnswer, error: errorUpdateAnswer} = useUpdateAnswerMutation()

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

    if (errorUpdateAnswer) {
        return <>
            <TextArea
                value={`Error updating answer: ${JSON.stringify(errorUpdateAnswer)}`}
                onChange={() => { }}
            />
        </>
    }

    return <>
        <QuestionAndAnswerForm
            questionNumber={questionNumber}
            question={question}
            answer={answer ?? emptyAnswer}
            onAnswerChange={(answer) => {
                updateAnswer(answer.id, answer.severity, answer.text)
            }}
        />
    </>
}

export default QuestionAndAnswerFormWithApi
