import React, { useEffect, useState } from 'react'

import { Answer, Progression, Question, Severity } from '../../api/models'
import QuestionAndAnswerForm from './QuestionAndAnswerForm'
import { genericErrorMessage, SavingState } from '../../utils/Variables'
import { useEffectNotOnMount, useShowErrorHook } from '../../utils/hooks'
import { ApolloError, gql, useMutation } from '@apollo/client'
import { ANSWER_FIELDS_FRAGMENT, QUESTION_ANSWERS_FRAGMENT } from '../../api/fragments'
import { deriveNewSavingState } from '../../views/helpers'
import ErrorBanner from '../ErrorBanner'

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
    const [localAnswerText, setLocalAnswerText] = useState<string>(answer && answer.text ? answer.text : '')
    const [localSeverity, setLocalSeverity] = useState<Severity>(answer && answer.severity ? answer.severity : Severity.Na)
    const { showErrorMessage, setShowErrorMessage } = useShowErrorHook(errorSettingAnswer)

    useEffect(() => {
        setSavingState(deriveNewSavingState(loading, savingState))
    }, [loading])

    useEffectNotOnMount(() => {
        const timeout = setTimeout(() => {
            setAnswer(question.id, localSeverity, localAnswerText, viewProgression)
        }, WRITE_DELAY_MS)
        return () => {
            clearTimeout(timeout)
        }
    }, [localAnswerText])

    useEffectNotOnMount(() => {
        setAnswer(question.id, localSeverity, localAnswerText, viewProgression)
    }, [localSeverity])

    return (
        <>
            {showErrorMessage && (
                <ErrorBanner message={'Could not save answer. ' + genericErrorMessage} onClose={() => setShowErrorMessage(false)} />
            )}
            <QuestionAndAnswerForm
                question={question}
                answer={{ ...(answer || emptyAnswer), text: localAnswerText, severity: localSeverity }}
                onAnswerTextChange={(text: string) => {
                    setLocalAnswerText(text)
                }}
                onSeverityChange={(severity: Severity) => {
                    setLocalSeverity(severity)
                }}
                disabled={disabled}
                savingState={savingState}
            />
        </>
    )
}

export default QuestionAndAnswerFormWithApi

interface SetAnswerMutationProps {
    setAnswer: (questionId: string, severity: Severity, text: string, progression: Progression) => void
    loading: boolean
    answer: Answer | undefined
    error: ApolloError | undefined
}

const useSetAnswerMutation = (): SetAnswerMutationProps => {
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
