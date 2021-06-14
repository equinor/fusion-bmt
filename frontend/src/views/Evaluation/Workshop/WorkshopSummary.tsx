import AnswerMarkdownForm from '../../../components/QuestionAndAnswer/AnswerMarkdownForm'
import { SavingState } from '../../../utils/Variables'
import SaveIndicator from '../../../components/SaveIndicator'


interface WorkshopSummaryProps {
    localSummary: string,
    onChange: (value: string) => void
    savingState: SavingState
}

const WorkshopSummary = ({
    localSummary,
    onChange,
    savingState,
}: WorkshopSummaryProps) => {
    return (
        <>
            <h3>Summary</h3>
            <p>
                As facilitator you can use this field to write up a summary of
                the workshop.
            </p>
            <AnswerMarkdownForm
                markdown={localSummary}
                onMarkdownChange={onChange}
                disabled={false}
            />
            <SaveIndicator savingState={savingState} />
        </>
    )
}

export default WorkshopSummary
