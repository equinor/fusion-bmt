import React from 'react'
import { Barrier } from '../../../../api/models'
import { barrierToString } from '../../../../utils/EnumToString'
import Sticky from '../../../../components/Sticky'
import { tokens } from '@equinor/eds-tokens'
import styled from 'styled-components'

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
    barrier: Barrier
    onBarrierSelected: (barrier: Barrier) => void
}

const BarrierSidebar = ({ barrier, onBarrierSelected }: Props) => {
    const selectBarrier = (barrier: Barrier) => {
        onBarrierSelected(barrier)
    }

    return (
        <Sticky>
            {Object.entries(Barrier).map(function ([_, b]) {
                return (
                    <MenuItem
                        key={b}
                        onClick={() => selectBarrier(b)}
                        $isActive={barrier === b}
                    >
                        {b + ' - ' + barrierToString(b)}
                    </MenuItem>
                )
            })}
        </Sticky>
    )
}

export default BarrierSidebar
