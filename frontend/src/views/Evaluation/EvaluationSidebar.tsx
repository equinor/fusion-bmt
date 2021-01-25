import * as React from 'react'
import { NavigationStructure, Chip, NavigationDrawer } from '@equinor/fusion-components'

import { Barrier, Question, Progression } from '../../api/models'
import { useAzureUniqueId } from '../../utils/Variables'
import { barrierToString } from '../../utils/EnumToString'
import { getFilledUserAnswersForProgression } from '../../utils/QuestionAndAnswerUtils'
import Sticky from '../../components/Sticky'

interface EvaluationSidebarProps {
    questions: Question[]
    barrier: Barrier
    viewProgression: Progression
    onBarrierSelected: (barrier: Barrier) => void
}

const EvaluationSidebar = ({ questions, barrier, viewProgression, onBarrierSelected }: EvaluationSidebarProps) => {
    const azureUniqueId: string = useAzureUniqueId()

    const selectBarrier = (barrier: Barrier) => {
        onBarrierSelected(barrier)
    }

    const structure: NavigationStructure[] = Object.entries(Barrier).map(([_, b]) => {
        const barrierQuestions = questions.filter(q => q.barrier === b)
        const answeredUsersBarrierAnswers = getFilledUserAnswersForProgression(barrierQuestions, viewProgression, azureUniqueId)

        return {
            id: b,
            type: 'grouping',
            title: barrierToString(b),
            icon: <>{b}</>,
            isActive: barrier === b,
            aside: <Chip title={`${answeredUsersBarrierAnswers.length}/${barrierQuestions.length}`} />,
        }
    })

    return (
        <Sticky>
            <NavigationDrawer
                id="navigation-drawer-story"
                structure={structure}
                selectedId={barrier}
                onChangeSelectedId={selectedBarrierId => {
                    selectBarrier(selectedBarrierId as Barrier)
                }}
                onChangeStructure={() => {}}
            />
        </Sticky>
    )
}

export default EvaluationSidebar
