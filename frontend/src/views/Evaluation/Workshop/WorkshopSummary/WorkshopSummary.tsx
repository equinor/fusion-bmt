import React from 'react'
import { ApolloError } from '@apollo/client'
import { useShowErrorHook } from '../../../../utils/hooks'
import { genericErrorMessage, SavingState } from '../../../../utils/Variables'
import SaveIndicator from '../../../../components/SaveIndicator'
import Disabler from '../../../../components/Disabler'
import ErrorBanner from '../../../../components/ErrorBanner'
import AnswerMarkdownForm from '../../../../components/QuestionAndAnswer/AnswerMarkdownForm'

interface WorkshopSummaryProps {
    localSummary: string
    onChange: (value: string) => void
    savingState: SavingState
    disable: boolean
    error: ApolloError | undefined
}

const WorkshopSummary = ({ localSummary, onChange, savingState, disable, error }: WorkshopSummaryProps) => {
    const { showErrorMessage, setShowErrorMessage } = useShowErrorHook(error)

    return (
        <>
            {showErrorMessage && (
                <ErrorBanner
                    message={'Could not save workshop summary. ' + genericErrorMessage}
                    onClose={() => setShowErrorMessage(false)}
                />
            )}

            <h3>Summary</h3>
            <p>As facilitator you can use this field to write up a summary of the workshop.</p>
            <Disabler disable={disable}>
                <AnswerMarkdownForm
                    markdown={localSummary === '' ? ' ' : localSummary /*Fixes backspace error in markdown editor*/}
                    onMarkdownChange={onChange}
                    disabled={false}
                />
            </Disabler>
            <SaveIndicator savingState={savingState} />
        </>
    )
}

export default WorkshopSummary
