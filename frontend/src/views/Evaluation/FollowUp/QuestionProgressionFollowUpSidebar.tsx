import * as React from 'react'

import { NavigationStructure, NavigationDrawer } from '@equinor/fusion-components'

import { Barrier, Answer } from '../../../api/models'
import { barrierToString } from '../../../utils/EnumToString'
import Sticky from '../../../components/Sticky'
import SeveritySummary from '../../../components/SeveritySummary'
import { countSeverities } from '../../../utils/Severity'

interface Props {
    followUpBarrierAnswers: (Answer | null)[]
    selectedBarrier: Barrier
    onSelectBarrier: (barrier: Barrier) => void
}

const QuestionProgressionFollowUpSidebar = ({ followUpBarrierAnswers, selectedBarrier, onSelectBarrier }: Props) => {
    const structure: NavigationStructure[] = Object.entries(Barrier).map(([_, b]) => {
        return {
            id: b,
            type: 'grouping',
            title: barrierToString(b),
            icon: <>{b}</>,
            isActive: selectedBarrier === b,
            aside: <SeveritySummary severityCount={countSeverities(followUpBarrierAnswers)} compact />,
        }
    })

    return (
        <Sticky>
            <NavigationDrawer
                id="navigation-drawer-story"
                structure={structure}
                selectedId={selectedBarrier}
                onChangeSelectedId={selectedBarrierId => {
                    onSelectBarrier(selectedBarrierId as Barrier)
                }}
                onChangeStructure={() => {}}
            />
        </Sticky>
    )
}

export default QuestionProgressionFollowUpSidebar
