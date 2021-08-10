import React from 'react'
import styled from 'styled-components'
import { tokens } from '@equinor/eds-tokens'
import { BowtieBarrierCard } from '../styles'
import { AnswersWithBarrier } from '../../../utils/Variables'
import { Typography } from '@equinor/eds-core-react'
import SeverityList from '../SeverityList'

const HEIGHT_FIRST_IN_SERIES = 300
const WIDTH_FIRST_IN_SERIES = 150
const DECREASE_HEIGHT_BY = 40
const DECREASE_WIDTH_BY = 15

const Box = styled(BowtieBarrierCard)<{ height: number }>`
    align-items: flex-start;
    padding: 20px;
    border-radius: 25px;
    margin-right: 20px;
    border: 5px double white;

    @media (max-width: 1800px) {
        margin-right: 10px;
        width: ${props => props.width - 25 + 'px'};
    }
`

interface Props {
    index: number
    headline: string
    items: AnswersWithBarrier[]
    isRight?: boolean
    extraWidth?: number
}

const DetailedBarrierCard = ({ index, headline, items, isRight, extraWidth = 0 }: Props) => {
    return (
        <div style={{ position: 'relative' }}>
            <Box
                backgroundColor={tokens.colors.ui.background__medium.rgba}
                height={HEIGHT_FIRST_IN_SERIES - index * DECREASE_HEIGHT_BY}
                width={WIDTH_FIRST_IN_SERIES - index * DECREASE_WIDTH_BY + extraWidth}
                isRight={isRight || false}
            >
                <Typography style={{ marginBottom: '30px', height: '2rem' }}>{headline}</Typography>
                <SeverityList items={items} />
            </Box>
        </div>
    )
}

export default DetailedBarrierCard
