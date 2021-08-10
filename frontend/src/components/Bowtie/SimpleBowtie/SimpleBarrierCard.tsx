import React from 'react'
import styled from 'styled-components'
import { tokens } from '@equinor/eds-tokens'
import { AnswersWithBarrier } from '../../../utils/Variables'
import { BowtieBarrierCard } from '../styles'
import SeverityList from '../SeverityList'

const HEIGHT_FIRST_IN_SERIES = 80
const WIDTH_FIRST_IN_SERIES = 35
const DECREASE_HEIGHT_BY = 10
const DECREASE_WIDTH_BY = 3

const Box = styled(BowtieBarrierCard)`
    align-items: center;
    padding: 5px;
    border-radius: 10px;
    margin-right: 5px;
    border: 1px solid lightgrey;
    justify-content: center;
`

interface Props {
    index: number
    items: AnswersWithBarrier[]
    isRight?: boolean
    extraWidth?: number
}

const SimpleBarrierCard = ({ index, items, isRight = false, extraWidth = 0 }: Props) => {
    return (
        <div style={{ position: 'relative' }}>
            <Box
                backgroundColor={tokens.colors.ui.background__medium.rgba}
                height={HEIGHT_FIRST_IN_SERIES - index * DECREASE_HEIGHT_BY}
                width={WIDTH_FIRST_IN_SERIES - index * DECREASE_WIDTH_BY + extraWidth}
                isRight={isRight}
            >
                <SeverityList items={items} isDense />
            </Box>
        </div>
    )
}

export default SimpleBarrierCard
