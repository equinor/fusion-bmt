import React from 'react'
import styled from 'styled-components'
import { tokens } from '@equinor/eds-tokens'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import { Typography } from '@equinor/eds-core-react'
import BarrierSeverity from './BarrierSeverity'

const HEIGHT_FIRST_IN_SERIES = 300
const WIDTH_FIRST_IN_SERIES = 150
const DECREASE_HEIGHT_BY = 40
const DECREASE_WIDTH_BY = 15

const Wrapper = styled.div`
    position: relative;
`

const Box = styled.div<{ backgroundColor: string; height: number; width: number; isRight: boolean }>`
    padding: 20px;
    height: ${props => props.height + 'px'};
    width: ${props => props.width + 'px'};
    background-color: ${props => props.backgroundColor};
    transform: ${props => (props.isRight ? 'perspective(600px) rotateY(350deg)' : 'perspective(600px) rotateY(10deg)')};
    border-radius: 25px;
    box-shadow: -10px 10px 20px 1px lightgrey;
    margin-right: 20px;
    border: 5px double white;

    @media (max-width: 1800px) {
        width: ${props => props.width - 20 + 'px'};
        margin-right: 15px;
    }
`

interface Props {
    index: number
    headline: string
    items: AnswersWithBarrier[]
    isRight?: boolean
    extraWidth?: number
}

const BarrierCard = ({ index, headline, items, isRight, extraWidth = 0 }: Props) => {
    return (
        <Wrapper>
            <Box
                backgroundColor={tokens.colors.ui.background__medium.rgba}
                height={HEIGHT_FIRST_IN_SERIES - index * DECREASE_HEIGHT_BY}
                width={WIDTH_FIRST_IN_SERIES - index * DECREASE_WIDTH_BY + extraWidth}
                isRight={isRight || false}
            >
                <Typography style={{ marginBottom: '30px', height: '2rem' }}>{headline}</Typography>
                <BarrierSeverity items={items} />
            </Box>
        </Wrapper>
    )
}

export default BarrierCard
