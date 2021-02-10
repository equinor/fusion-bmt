import React from 'react'

import { NavigationStructure, NavigationDrawer } from '@equinor/fusion-components'

import { Barrier, Question, Progression } from '../../../api/models'
import { barrierToString } from '../../../utils/EnumToString'
import Sticky from '../../../components/Sticky'
import SeveritySummary from '../../../components/SeveritySummary'
import { countSeverities } from '../../../utils/Severity'

interface Props {
    questions: Question[]
    selectedBarrier: Barrier
    onSelectBarrier: (barrier: Barrier) => void
}

const QuestionProgressionFollowUpSidebar = ({ questions, selectedBarrier, onSelectBarrier }: Props) => {
    const structure: NavigationStructure[] = Object.entries(Barrier).map(([_, b]) => {
        const followUpBarrierAnswers = questions
            .filter(q => q.barrier === b)
            .map(q => {
                const answers = q.answers.filter(a => a.progression === Progression.FollowUp)
                const length = answers.length
                if (length === 0) {
                    return null
                }
                return answers[0]
            })
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
