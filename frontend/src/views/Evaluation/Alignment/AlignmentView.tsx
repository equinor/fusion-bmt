import React from 'react'
import { Barrier, Evaluation, Question, Progression, Role } from '../../../api/models'
import { Box } from '@material-ui/core'
import BarrierQuestionsView from '../../../components/BarrierQuestionsView'
import EvaluationSidebar from '../EvaluationSidebar'
import AnswerSummarySidebar from '../../../components/AnswerSummarySidebar'

interface AlignmentViewProps
{
    evaluation: Evaluation
    onNextStepClick: () => void
    onProgressParticipant: (newProgressions: Progression) => void
}

const AlignmentView = ({evaluation, onNextStepClick, onProgressParticipant}: AlignmentViewProps) => {
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
                        viewProgression={Progression.Alignment}
                        onBarrierSelected={ (barrier) => setSelectedBarrier(barrier)}
                    />
                </Box>
                <Box p="20px" width="1">
                    <BarrierQuestionsView
                        barrier={selectedBarrier}
                        questions={questions}
                        currentProgression={evaluation.progression}
                        viewProgression={Progression.Alignment}
                        onNextStepClick={onNextStepClick}
                        allowedRoles={ [Role.OrganizationLead, Role.Facilitator] }
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
                            previousProgression={Progression.Preparation}
                        />
                    }
                </Box>
            </Box>
        </>
    )
}

export default AlignmentView
