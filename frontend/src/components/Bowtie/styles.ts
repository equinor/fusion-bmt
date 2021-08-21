import styled from 'styled-components'
import { tokens } from '@equinor/eds-tokens'

const BACKGROUND_COLOR = tokens.colors.ui.background__medium.rgba

export const BowtieBarrierCard = styled.div<{ height: number; width: number; isRight: boolean }>`
    display: flex;
    flex-direction: column;
    height: ${props => props.height + 'px'};
    width: ${props => props.width + 'px'};
    background-color: ${BACKGROUND_COLOR};
    transform: ${props => (props.isRight ? 'perspective(600px) rotateY(350deg)' : 'perspective(600px) rotateY(10deg)')};
`
