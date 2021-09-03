import AnswerMarkdownForm from '../../../components/QuestionAndAnswer/AnswerMarkdownForm'
import { SavingState } from '../../../utils/Variables'
import SaveIndicator from '../../../components/SaveIndicator'
import Disabler from '../../../components/Disabler'

interface WorkshopSummaryProps {
    localSummary: string
    onChange: (value: string) => void
    savingState: SavingState
    disable: boolean
}

const WorkshopSummary = ({ localSummary, onChange, savingState, disable }: WorkshopSummaryProps) => {
    return (
        <>
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
