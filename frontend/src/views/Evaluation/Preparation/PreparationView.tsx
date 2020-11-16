import React, { useState } from 'react'
import { Barrier, Evaluation, Question } from '../../../api/models'
import { Box } from '@material-ui/core'
import BarrierQuestionsView from './BarrierQuestionsView'
import EvaluationSidebar from '../EvaluationSidebar'

interface PreparationViewProps
{
    evaluation: Evaluation
}

const PreparationView = ({evaluation}: PreparationViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)

    const [questions, setQuestions] = useState<Question[]>([])

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
                    questions={
                        questions.filter(
                            q => q.barrier === selectedBarrier
                        )
                    }
                />
            </Box>
        </Box>

    )
}

export default PreparationView
