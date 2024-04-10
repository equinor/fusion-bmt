import React from 'react'
import { Chip, Typography } from '@equinor/eds-core-react'
import { Barrier, Question, Progression } from '../api/models'
import { useAzureUniqueId } from '../utils/Variables'
import { barrierToString } from '../utils/EnumToString'
import { getFilledUserAnswersForProgression } from '../utils/QuestionAndAnswerUtils'
import Sticky from './Sticky'
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

interface EvaluationSidebarProps {
    questions: Question[]
    barrier: Barrier
    viewProgression: Progression
    onBarrierSelected: (barrier: Barrier) => void
}

const EvaluationSidebar = ({ questions, barrier, viewProgression, onBarrierSelected }: EvaluationSidebarProps) => {
    const azureUniqueId: string = useAzureUniqueId()
    const [sideBarMinimized, setSideBarMinimized] = React.useState<boolean>(false)

    const selectBarrier = (barrier: Barrier) => {
        onBarrierSelected(barrier)
    }

    return (
        <Sticky data-testid="sticky-toplevel">
            {Object.entries(Barrier).map(function ([_, b]) {
                const barrierQuestions = questions.filter(q => q.barrier === b)
                const answeredUsersBarrierAnswers = getFilledUserAnswersForProgression(barrierQuestions, viewProgression, azureUniqueId)

                return (

                    <MenuItem
                        key={b}
                        onClick={() => selectBarrier(b)}
                        $isActive={barrier === b}
                    >
                        <Typography>{barrierToString(b)}</Typography>
                        <Chip data-testid={`barrier+${b}`}> {answeredUsersBarrierAnswers.length}/{barrierQuestions.length} </Chip>
                    </MenuItem>
                )
            })}
        </Sticky>
    )
}

export default EvaluationSidebar
