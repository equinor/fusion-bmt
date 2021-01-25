import { ApolloError, gql, useMutation } from '@apollo/client'
import { TextArea } from '@equinor/fusion-components'
import React from 'react'
import { ANSWER_FIELDS_FRAGMENT, QUESTION_ANSWERS_FRAGMENT } from '../../api/fragments'

import { Answer, Progression, Question, Severity } from '../../api/models'
import QuestionAndAnswerForm from './QuestionAndAnswerForm'

interface SetAnswerMutationProps {
    setAnswer: (questionId: string, severity: Severity, text: string, progression: Progression) => void
    loading: boolean
    answer: Answer | undefined
    error: ApolloError | undefined
}

export const useSetAnswerMutation = (): SetAnswerMutationProps => {
    const SET_ANSWER = gql`
        mutation SetAnswer($questionId: String, $severity: Severity!, $text: String, $progression: Progression!) {
            setAnswer(questionId: $questionId, severity: $severity, text: $text, progression: $progression) {
                ...AnswerFields
                question {
                    id
                }
            }
        }
        ${ANSWER_FIELDS_FRAGMENT}
    `

    const [setAnswerApolloFunc, { loading, data, error }] = useMutation(SET_ANSWER, {
        update(cache, { data: { setAnswer: answer } }) {
            const questionId: string = answer.question.id
            const questionFragmentId: string = `Question:${questionId}`
            const oldFragment: Question | null = cache.readFragment({
                id: questionFragmentId,
                fragmentName: 'QuestionAnswers',
                fragment: QUESTION_ANSWERS_FRAGMENT,
            })
            const newData = {
                answers: [...oldFragment!.answers.filter(a => a.id !== answer.id), answer],
            }
            cache.writeFragment({
                id: questionFragmentId,
                data: newData,
                fragmentName: 'QuestionAnswers',
                fragment: QUESTION_ANSWERS_FRAGMENT,
            })
        },
    })

    const setAnswer = (questionId: string, severity: Severity, text: string, progression: Progression) => {
        setAnswerApolloFunc({ variables: { questionId, severity, text, progression } })
    }

    return {
        setAnswer: setAnswer,
        loading,
        answer: data?.setAnswer,
        error,
    }
}

interface QuestionAndAnswerFormWithApiProps {
    questionNumber: number
    question: Question
    answer: Answer | undefined
    disabled: boolean
    viewProgression: Progression
}

const QuestionAndAnswerFormWithApi = ({
    questionNumber,
    question,
    answer,
    disabled,
    viewProgression,
}: QuestionAndAnswerFormWithApiProps) => {
    const { setAnswer, error: errorSettingAnswer } = useSetAnswerMutation()

    const emptyAnswer: Answer = {
        id: '',
        progression: Progression.Nomination,
        severity: Severity.Na,
        text: '',
        createDate: '',
        question: question,
        questionId: question.id,
    }

    if (errorSettingAnswer !== undefined) {
        return (
            <div>
                <TextArea value={`Error setting answer: ${JSON.stringify(errorSettingAnswer)}`} onChange={() => {}} />
            </div>
        )
    }

    return (
        <>
            <QuestionAndAnswerForm
                questionNumber={questionNumber}
                question={question}
                answer={answer ?? emptyAnswer}
                onAnswerChange={answer => setAnswer(question.id, answer.severity, answer.text, viewProgression)}
                disabled={disabled}
            />
        </>
    )
}

export default QuestionAndAnswerFormWithApi
