import React from 'react'
import styled from 'styled-components'
import { tokens } from '@equinor/eds-tokens'

const Circle = styled.div<{ color: string }>`
    width: 30px;
    height: 30px;
    background: ${props => props.color};
    border-radius: 50%;
    margin-right: 5px;
`

const SimpleTopEvent = () => {
    const color = tokens.colors.infographic.substitute__blue_ocean.rgba

    return <Circle color={color} />
}

export default SimpleTopEvent
