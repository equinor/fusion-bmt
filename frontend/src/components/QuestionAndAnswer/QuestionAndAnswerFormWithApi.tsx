import { ApolloError, gql, useMutation } from '@apollo/client'
import { TextArea } from '@equinor/fusion-components'
import React, { useEffect, useState } from 'react'
import { ANSWER_FIELDS_FRAGMENT, QUESTION_ANSWERS_FRAGMENT } from '../../api/fragments'

import { Answer, Progression, Question, Severity } from '../../api/models'
import QuestionAndAnswerForm from './QuestionAndAnswerForm'
import { SavingState } from '../../utils/Variables'
import { useEffectNotOnMount } from '../../utils/hooks'
import { apiErrorMessage } from '../../api/error'

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
    question: Question
    answer: Answer | undefined
    disabled: boolean
    viewProgression: Progression
}

const WRITE_DELAY_MS = 1000

const QuestionAndAnswerFormWithApi = ({ question, answer, disabled, viewProgression }: QuestionAndAnswerFormWithApiProps) => {
    const emptyAnswer: Answer = {
        id: '',
        progression: Progression.Nomination,
        severity: Severity.Na,
        text: '',
        createDate: '',
        question: question,
        questionId: question.id,
    }

    const { setAnswer, loading, error: errorSettingAnswer } = useSetAnswerMutation()
    const [savingState, setSavingState] = useState<SavingState>(SavingState.None)
    const [localAnswer, setLocalAnswer] = useState<Answer>(answer ?? emptyAnswer)

    useEffect(() => {
        if (loading) {
            setSavingState(SavingState.Saving)
        } else {
            if (savingState === SavingState.Saving) {
                setSavingState(SavingState.Saved)
            } else {
                setSavingState(SavingState.None)
            }
        }
    }, [loading])

    useEffectNotOnMount(() => {
        const timeout = setTimeout(() => {
            setAnswer(question.id, localAnswer.severity, localAnswer.text, viewProgression)
        }, WRITE_DELAY_MS)
        return () => {
            clearTimeout(timeout)
        }
    }, [localAnswer])

    if (errorSettingAnswer !== undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not save answer')} onChange={() => {}} />
            </div>
        )
    }

    return (
        <>
            <QuestionAndAnswerForm
                question={question}
                answer={localAnswer}
                onAnswerChange={answerParts => {
                    setSavingState(SavingState.Saving)
                    setLocalAnswer(oldLocalAnswer => ({ ...oldLocalAnswer, ...answerParts }))
                }}
                disabled={disabled}
                savingState={savingState}
            />
        </>
    )
}

export default QuestionAndAnswerFormWithApi
