import React from 'react'
import { Typography } from '@equinor/eds-core-react'
import styled from 'styled-components'
import { tokens } from '@equinor/eds-tokens'

const greyEDS = tokens.colors.ui.background__medium.rgba

const Wrapper = styled.div<{ $marginleft: string }>`
    width: 48%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    justify-self: center;
    margin-left: ${props => props.$marginleft};
`

const ArrowIllustration = styled.div`
    width: 100%;
    margin-top: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
`

const Line = styled.div`
    width: 90%;
    height: 1px;
    border-bottom: 7px solid ${greyEDS};
`

const Triangle = styled.div`
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 20px solid ${greyEDS};
`

interface Props {
    text: string
    placementRight?: boolean
}

const Arrow = ({ text, placementRight }: Props) => {
    const marginLeft = placementRight ? '150px' : '10px'
    return (
        <Wrapper $marginleft={marginLeft}>
            <Typography>{text}</Typography>
            <ArrowIllustration>
                <Line />
                <Triangle />
            </ArrowIllustration>
        </Wrapper>
    )
}

export default Arrow
