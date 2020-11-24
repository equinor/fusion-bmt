import * as React from 'react'
import { Barrier, Question } from '../../api/models'
import { NavigationStructure, Chip, NavigationDrawer } from '@equinor/fusion-components'
import { getAzureUniqueId } from '../../utils/Variables'
import { barrierToString } from '../../utils/EnumToString'


interface EvaluationSidebarProps
{
    questions: Question[]
    barrier: Barrier
    onBarrierSelected: (barrier: Barrier) => void
}

const EvaluationSidebar = ({questions, barrier, onBarrierSelected}: EvaluationSidebarProps) => {
    const azureUniqueId: string = getAzureUniqueId()

    const [structure, setStructure] = React.useState<NavigationStructure[]>(
        Object.entries(Barrier).map(([barrierKey, barrier]) => {
            const barrierQuestions = questions.filter(q => q.barrier == barrier)
            const barrierAnswers = barrierQuestions.map(bq => bq.answers.find(a => a.answeredBy?.azureUniqueId === azureUniqueId))

            return {
                id: barrier,
                type: 'grouping',
                title: barrierToString(barrier),
                icon: <>{barrierKey}</>,
                aside: <Chip title={`${barrierAnswers.length}/${barrierQuestions.length}`} />
            }
        })
    )

    return (
        <NavigationDrawer
            id="navigation-drawer-story"
            structure={structure}
            selectedId={barrier}
            onChangeSelectedId={(selectedBarrierId) => {
                onBarrierSelected(selectedBarrierId as Barrier)
            }}
            onChangeStructure={(newStructure) => {
                setStructure(newStructure)
            }}
        />
    )
}

export default EvaluationSidebar
