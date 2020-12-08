import React from 'react'
import { Barrier, Evaluation, Question, Progression } from '../../../api/models'
import { Box } from '@material-ui/core'
import BarrierQuestionsView from '../../../components/BarrierQuestionsView'
import EvaluationSidebar from '../EvaluationSidebar'
import { useQuestionsQuery } from '../Preparation/PerparationGQL'
import { TextArea } from '@equinor/fusion-components'
import AnswerSummarySidebar from '../../../components/AnswerSummarySidebar'

interface WorkshopViewProps
{
    evaluation: Evaluation
    onNextStepClick: () => void
}

const WorkshopView = ({evaluation, onNextStepClick}: WorkshopViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question | undefined>(undefined)
    const [selectedQuestionNumber, setSelectedQuestionNumber] = React.useState<number | undefined>(undefined)

    const {loading: loadingQuestions, questions, error: errorQuestions} = useQuestionsQuery(evaluation.id)

    if(errorQuestions !== undefined){
        return <div>
            <TextArea
                value={`Error in loading questions: ${JSON.stringify(errorQuestions)}`}
                onChange={() => { }}
            />
        </div>
    }

    if(loadingQuestions){
        return <>Loading...</>
    }

    if(questions === undefined){
        return <div>
            <TextArea
                value={`Questions is undefined`}
                onChange={() => { }}
            />
        </div>
    }

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
                        onQuestionSummarySelected={ (question: Question, questionNumber: number) => {
                            setSelectedQuestion(question)
                            setSelectedQuestionNumber(questionNumber)
                        }}
                    />
                </Box>
            </Box>

            { selectedQuestion && selectedQuestionNumber &&
                <AnswerSummarySidebar
                    open={selectedQuestion != undefined}
                    onCloseClick={() => {
                        setSelectedQuestion(undefined)
                        setSelectedQuestionNumber(undefined)
                    }}
                    question={selectedQuestion}
                    questionNumber={selectedQuestionNumber}
                    previousProgression={Progression.Alignment}
                />
            }
        </>
    )
}

export default WorkshopView
