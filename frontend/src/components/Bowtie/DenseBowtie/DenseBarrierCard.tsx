import React from 'react'
import styled from 'styled-components'
import { AnswersWithBarrier } from '../../../utils/Variables'
import { BowtieBarrierCard } from '../styles'
import SeverityList from '../SeverityList'
import { Tooltip } from '@equinor/eds-core-react'
import { tokens } from '@equinor/eds-tokens'

const HEIGHT_FIRST_IN_SERIES = 60
const WIDTH_FIRST_IN_SERIES = 25
const DECREASE_HEIGHT_BY = 8
const DECREASE_WIDTH_BY = 2
const BACKGROUND_COLOR = tokens.colors.ui.background__light.rgba

const Box = styled(BowtieBarrierCard)`
    align-items: center;
    padding: 5px;
    border-radius: 10px;
    margin-right: 5px;
    border: 1px solid lightgrey;
    justify-content: center;
    background-color: ${BACKGROUND_COLOR};
`

interface Props {
    index: number
    items: AnswersWithBarrier[]
    headline: string
    isRight?: boolean
    extraWidth?: number
}

const DenseBarrierCard = ({ index, items, isRight = false, extraWidth = 0, headline }: Props) => {
    return (
        <Tooltip title={headline} placement="bottom">
            <Box
                $height={HEIGHT_FIRST_IN_SERIES - index * DECREASE_HEIGHT_BY}
                $width={WIDTH_FIRST_IN_SERIES - index * DECREASE_WIDTH_BY + extraWidth}
                $isright={isRight}
            >
                <SeverityList items={items} isDense />
            </Box>
        </Tooltip>
    )
}

export default DenseBarrierCard
