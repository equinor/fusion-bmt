import React from 'react'
import { Barrier, Evaluation } from '../../../api/models'
import { Box } from '@material-ui/core'
import BarrierQuestionsView from './BarrierQuestionsView'
import EvaluationSidebar from '../EvaluationSidebar'
import { useQuestionsQuery } from './PerparationGQL'
import { TextArea } from '@equinor/fusion-components'

interface PreparationViewProps
{
    evaluation: Evaluation
    onNextStepClick: () => void
}

const PreparationView = ({evaluation, onNextStepClick}: PreparationViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)

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
        <Box display="flex" height={1}>
            <Box>
                <EvaluationSidebar
                    questions={questions}
                    barrier={selectedBarrier}
                    onBarrierSelected={ (barrier) => setSelectedBarrier(barrier)}
                />
            </Box>
            <Box p="20px" width="1">
                <BarrierQuestionsView
                    barrier={selectedBarrier}
                    questions={questions}
                    currentProgression={evaluation.progression}
                    onNextStepClick={onNextStepClick}
                />
            </Box>
        </Box>
    )
}

export default PreparationView
