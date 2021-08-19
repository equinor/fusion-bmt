import React from 'react'
import styled from 'styled-components'
import { AnswersWithBarrier } from '../../../utils/Variables'
import { BowtieBarrierCard } from '../styles'
import SeverityList from '../SeverityList'
import { Tooltip } from '@equinor/eds-core-react'

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
    headline: string
    isRight?: boolean
    extraWidth?: number
}

const DenseBarrierCard = ({ index, items, isRight = false, extraWidth = 0, headline }: Props) => {
    return (
        <div style={{ position: 'relative' }}>
            <Box
                height={HEIGHT_FIRST_IN_SERIES - index * DECREASE_HEIGHT_BY}
                width={WIDTH_FIRST_IN_SERIES - index * DECREASE_WIDTH_BY + extraWidth}
                isRight={isRight}
            >
                <Tooltip title={headline} placement="top">
                    <SeverityList items={items} isDense />
                </Tooltip>
            </Box>
        </div>
    )
}

export default DenseBarrierCard
