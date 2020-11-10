import * as React from 'react';
import { Barrier, Question, Participant } from '../../api/models';
import { NavigationStructure, Chip, NavigationDrawer } from '@equinor/fusion-components';

interface EvaluationSidebarProps
{
    questions: Question[];
    participant: Participant;
    onBarrierSelected: (barrier: string) => void;
}

const EvaluationSidebar = ({questions, participant, onBarrierSelected}: EvaluationSidebarProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.GM);
    const [structure, setStructure] = React.useState<NavigationStructure[]>(
        Object.entries(Barrier).map(([shortName, barrierName]) => {
            const barrierQuestions = questions.filter(q => q.barrier == barrierName);
            const barrierAnswers = barrierQuestions.map(bq => bq.answers.find(a => a.answeredBy === participant))

            return {
                id: barrierName,
                type: 'grouping',
                title: barrierName,
                icon: <>{shortName}</>,
                aside: <Chip title={`${barrierAnswers.length}/${barrierQuestions.length}`} />
            }
        })
    );

    return (
        <NavigationDrawer
            id="navigation-drawer-story"
            structure={structure}
            selectedId={selectedBarrier}
            onChangeSelectedId={(selectedItem) => {
                setSelectedBarrier(selectedItem as Barrier);
                onBarrierSelected(selectedItem);
            }}
            onChangeStructure={(newStructure) => {
                setStructure(newStructure);
            }}
        />
    );
};

export default EvaluationSidebar;
