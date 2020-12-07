import React from 'react'
import { Barrier, Evaluation, Question, Progression, Role } from '../../../api/models'
import { Box } from '@material-ui/core'
import BarrierQuestionsView from '../../../components/BarrierQuestionsView'
import EvaluationSidebar from '../EvaluationSidebar'
import AnswerSummarySidebar from '../../../components/AnswerSummarySidebar'

interface WorkshopViewProps
{
    evaluation: Evaluation
    onNextStepClick: () => void
    onProgressParticipant: (newProgressions: Progression) => void
}

const WorkshopView = ({evaluation, onNextStepClick, onProgressParticipant}: WorkshopViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question | undefined>(undefined)
    const [selectedQuestionNumber, setSelectedQuestionNumber] = React.useState<number | undefined>(undefined)

    const questions = evaluation.questions

    return (
        <>
            <Box display="flex" height={1}>
                <Box>
                    <EvaluationSidebar
                        questions={questions}
                        barrier={selectedBarrier}
                        viewProgression={Progression.Workshop}
                        onBarrierSelected={ (barrier) => setSelectedBarrier(barrier)}
                    />
                </Box>
                <Box p="20px" width="1">
                    <BarrierQuestionsView
                        barrier={selectedBarrier}
                        questions={questions}
                        currentProgression={evaluation.progression}
                        viewProgression={Progression.Workshop}
                        onNextStepClick={onNextStepClick}
                        allowedRoles={[Role.Facilitator]}
                        onQuestionSummarySelected={ (question: Question, questionNumber: number) => {
                            setSelectedQuestion(question)
                            setSelectedQuestionNumber(questionNumber)
                        }}
                        onCompleteSwitchClick={onProgressParticipant}
                    />
                </Box>
                <Box>
                    { selectedQuestion && selectedQuestionNumber &&
                        <AnswerSummarySidebar
                            open={selectedQuestion != undefined}
                            onCloseClick={() => {
                                setSelectedQuestion(undefined)
                                setSelectedQuestionNumber(undefined)
                            }}
                            question={selectedQuestion}
                            questionNumber={selectedQuestionNumber}
                            viewProgression={Progression.Workshop}
                        />
                    }
                </Box>
            </Box>
        </>
    )
}

export default WorkshopView
