import styled from 'styled-components'

export const BowtieBarrierCard = styled.div<{ backgroundColor: string; height: number; width: number; isRight: boolean }>`
    display: flex;
    flex-direction: column;
    height: ${props => props.height + 'px'};
    width: ${props => props.width + 'px'};
    background-color: ${props => props.backgroundColor};
    transform: ${props => (props.isRight ? 'perspective(600px) rotateY(350deg)' : 'perspective(600px) rotateY(10deg)')};
`
