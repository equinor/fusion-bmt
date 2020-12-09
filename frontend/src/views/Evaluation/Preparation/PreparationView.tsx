import React from 'react'
import { Barrier, Evaluation, Progression, Role } from '../../../api/models'
import { Box } from '@material-ui/core'
import BarrierQuestionsView from '../../../components/BarrierQuestionsView'
import EvaluationSidebar from '../EvaluationSidebar'

interface PreparationViewProps
{
    evaluation: Evaluation
    onNextStepClick: () => void
    onProgressParticipant: (newProgressions: Progression) => void
}

const PreparationView = ({evaluation, onNextStepClick, onProgressParticipant}: PreparationViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)

    const questions = evaluation.questions

    return (
        <Box display="flex" height={1}>
            <Box>
                <EvaluationSidebar
                    questions={questions}
                    barrier={selectedBarrier}
                    viewProgression={Progression.Preparation}
                    onBarrierSelected={ (barrier) => setSelectedBarrier(barrier)}
                />
            </Box>
            <Box p="20px" width="1">
                <BarrierQuestionsView
                    barrier={selectedBarrier}
                    questions={questions}
                    currentProgression={evaluation.progression}
                    viewProgression={Progression.Preparation}
                    onNextStepClick={onNextStepClick}
                    onCompleteSwitchClick={onProgressParticipant}
                    allowedRoles={ Object.values(Role) }
                />
            </Box>
        </Box>
    )
}

export default PreparationView
