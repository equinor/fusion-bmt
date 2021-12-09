import { useState } from 'react'
import { ApolloError, gql, useMutation } from '@apollo/client'

import { Evaluation } from '../../../../api/models'
import { useEffectNotOnMount, useSavingStateCheck } from '../../../../utils/hooks'
import { SavingState } from '../../../../utils/Variables'
import WorkshopSummary from './WorkshopSummary'

const WRITE_DELAY_MS = 1000

interface WorkshopSummaryWithApiProps {
    evaluation: Evaluation
    disable: boolean
}

const WorkshopSummaryWithApi = ({ evaluation, disable }: React.PropsWithChildren<WorkshopSummaryWithApiProps>) => {
    const [localSummary, setLocalSummary] = useState(evaluation.summary ?? '')
    const { setSummary, loading, error } = useSummaryMutation()
    const { savingState, setSavingState } = useSavingStateCheck(loading, error !== undefined)

    const onChange = (value: string) => {
        setSavingState(SavingState.Saving)
        setLocalSummary(value)
    }

    useEffectNotOnMount(() => {
        const timeout = setTimeout(() => {
            setSummary(evaluation.id, localSummary)
        }, WRITE_DELAY_MS)
        return () => {
            clearTimeout(timeout)
        }
    }, [localSummary])

    return (
        <div style={{ padding: '30px' }} data-testid="workshop_summary_div">
            <WorkshopSummary localSummary={localSummary} onChange={onChange} savingState={savingState} disable={disable} error={error} />
        </div>
    )
}

export default WorkshopSummaryWithApi

interface SetSummaryMutationProps {
    setSummary: (evaluationId: string, summary: string) => void
    loading: boolean
    error: ApolloError | undefined
}

const useSummaryMutation = (): SetSummaryMutationProps => {
    const SET_SUMMARY = gql`
        mutation SetSummary($evaluationId: String, $summary: String) {
            setSummary(evaluationId: $evaluationId, summary: $summary) {
                id
                summary
            }
        }
    `

    const [setSummaryApollo, { loading, error }] = useMutation(SET_SUMMARY)
    const setSummary = (evaluationId: string, summary: string) => {
        setSummaryApollo({
            variables: {
                evaluationId: evaluationId,
                summary: summary,
            },
        })
    }

    return {
        setSummary: setSummary,
        loading,
        error,
    }
}
