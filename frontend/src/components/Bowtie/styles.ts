import styled from 'styled-components'

export const BowtieBarrierCard = styled.div<{ $height: number; $width: number; $isright: boolean }>`
    display: flex;
    flex-direction: column;
    height: ${props => props.$height + 'px'};
    width: ${props => props.$width + 'px'};
    transform: ${props => (props.$isright ? 'perspective(600px) rotateY(350deg)' : 'perspective(600px) rotateY(10deg)')};
`
