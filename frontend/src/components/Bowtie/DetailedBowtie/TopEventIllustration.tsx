import React from 'react'
import styled from 'styled-components'
import { Typography } from '@equinor/eds-core-react'
import { tokens } from '@equinor/eds-tokens'

const Circle = styled.div<{ color: string }>`
    width: 100px;
    height: 100px;
    background: ${props => props.color};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    border: 5px double white;
`

const Text = styled(Typography)`
    color: white;
    font-size: 1rem;
    font-weight: bold;
`

const TopEventIllustration = () => {
    const color = tokens.colors.infographic.substitute__blue_ocean.rgba

    return (
        <Circle color={color}>
            <Text>Top Event</Text>
        </Circle>
    )
}

export default TopEventIllustration
