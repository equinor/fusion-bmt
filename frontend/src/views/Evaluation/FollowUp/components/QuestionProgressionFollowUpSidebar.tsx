import React from 'react'
import { Barrier, Question, Progression } from '../../../../api/models'
import { barrierToString } from '../../../../utils/EnumToString'
import Sticky from '../../../../components/Sticky'
import SeveritySummary from '../../../../components/SeveritySummary'
import { countSeverities } from '../../../../utils/Severity'
import styled from 'styled-components'
import { tokens } from '@equinor/eds-tokens'

const MenuItem = styled.div<{ $isActive: boolean }>`
    border-right: 3px solid ${({ $isActive }) => ($isActive ? tokens.colors.interactive.primary__resting.rgba : '#DCDCDC')};
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 15px 20px;
    white-space: nowrap;
    cursor: pointer;
    background-color: ${({ $isActive }) => ($isActive ? tokens.colors.ui.background__light.rgba : tokens.colors.ui.background__default.rgba)};
    &:hover {
        background-color: ${tokens.colors.ui.background__light.rgba};
    }
`

interface Props {
    questions: Question[]
    selectedBarrier: Barrier
    onSelectBarrier: (barrier: Barrier) => void
}

const QuestionProgressionFollowUpSidebar = ({ questions, selectedBarrier, onSelectBarrier }: Props) => {

    return (
        <Sticky>
            {Object.entries(Barrier).map(function ([_, b]) {
                const barrierQuestions = questions.filter(q => q.barrier === b)
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
                return (
                    <MenuItem
                        key={b}
                        onClick={() => onSelectBarrier(b)}
                        $isActive={selectedBarrier === b}
                    >
                        {barrierToString(b)}
                        <SeveritySummary severityCount={countSeverities(followUpBarrierAnswers)} compact />
                    </MenuItem>
                )
            })}
        </Sticky>
    )
}

export default QuestionProgressionFollowUpSidebar
