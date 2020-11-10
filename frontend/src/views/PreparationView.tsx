
import * as React from 'react';
import { Barrier, Evaluation, Participant } from '../api/models';
import { Box, Container } from '@material-ui/core';
import BarrierQuestionsView from './BarrierQuestionsView';
import EvaluationSidebar from './EvaluationSidebar';

interface PreparationViewProps
{
    evaluation: Evaluation
    participant: Participant
}

const PreparationView = ({evaluation, participant}: PreparationViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<string>(Object.values(Barrier)[0]);

    return (
        <Box display="flex" height={1}>
            <Box>
                <EvaluationSidebar
                    questions={evaluation.questions}
                    participant={participant}
                    onBarrierSelected={ (barrier) => setSelectedBarrier(barrier)}
                />
            </Box>
            <Box p="20px" width="1">
                <BarrierQuestionsView
                    barrier={selectedBarrier}
                    questions={
                        evaluation.questions.filter(
                            q => q.barrier === selectedBarrier
                        )
                    }
                    participant={participant}
                />
            </Box>
        </Box>

    );
};

export default PreparationView;
