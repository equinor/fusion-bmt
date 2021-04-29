import React from 'react'
import { Typography } from '@equinor/eds-core-react'
import styled from 'styled-components'
import { tokens } from '@equinor/eds-tokens'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import BowtieColumn from './BowtieColumn'
import BarrierSeverity from './BarrierSeverity'

const Background = styled.div`
    display: flex;
    align-items: center;
    z-index: -1;
`

const Foreground = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`

const BowtieSide = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(200px, 1fr));
    align-content: center;
    width: 850px;
    height: 100%;
    padding-left: 4rem;
    padding-right: 2rem;

    @media (max-width: 2000px) {
        width: 650px;
        grid-template-columns: repeat(4, minmax(150px, 1fr));
    }
`

const Left = styled(BowtieSide)``

const Right = styled(BowtieSide)`
    margin-left: 12rem;
`

const MiddleText = styled.div`
    position: absolute;
    bottom: 200px;
    display: flex;
    justify-content: center;
    width: 100%;
`

const Arrow = styled.div`
    width: 0;
    height: 0;
    border-top: 34vh solid transparent;
    border-bottom: 34vh solid transparent;
`

const ArrowRight = styled(Arrow)<{ color: string }>`
    border-left: 1100px solid ${props => props.color};

    @media (max-width: 2000px) {
        border-left-width: 875px;
    }
`

const ArrowLeft = styled(Arrow)<{ color: string }>`
    border-right: 1100px solid ${props => props.color};

    @media (max-width: 2000px) {
        border-right-width: 875px;
    }
`

const MiddleCircle = styled.div<{ color: string }>`
    width: 250px;
    height: 250px;
    background: ${props => props.color};
    border-radius: 50%;
    margin-left: -250px;
    margin-right: -250px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 2000px) {
        width: 200px;
        height: 200px;
        margin-left: -200px;
        margin-right: -200px;
    }
`

const RedCircle = styled.div<{ color: string }>`
    width: 200px;
    height: 200px;
    background: ${props => props.color};
    border-radius: 50%;
    z-index: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 2000px) {
        width: 150px;
        height: 150px;
    }
`

const Text = styled(Typography)`
    color: white;
    text-transform: uppercase;
    font-size: 1rem;
    font-weight: bold;
`

interface Props {
    answersWithBarrier: AnswersWithBarrier[]
}

const Bowtie = ({ answersWithBarrier }: Props) => {
    const colorGreen = tokens.colors.interactive.primary__selected_highlight.rgba
    const colorRed = tokens.colors.interactive.danger__text.rgba
    const GMBarriers = ['GM']
    const structureBarriers = ['PS15', 'PS16', 'PS18', 'PS19', 'PS20']
    const containmentBarriers = ['PS1', 'PS12', 'PS17']
    const safetySystemsBarriers = ['PS3', 'PS4', 'PS7', 'PS22', 'PS23']
    const ignitionControlBarriers = ['PS2', 'PS6']
    const protectionSystemBarriers = ['PS5', 'PS8', 'SP9', 'PS10']
    const powerAndCommunicationBarriers = ['PS11', 'PS13']
    const lifeSavingBarriers = ['PS14']

    const pickBarriers = (barriers: string[]) => {
        return answersWithBarrier.filter(obj => barriers.includes(obj.barrier))
    }

    return (
        <div style={{ position: 'relative' }}>
            <Background>
                <ArrowRight color={colorGreen} />
                <MiddleCircle color={colorGreen}>
                    <RedCircle color={colorRed}>
                        <Text>Top Event</Text>
                    </RedCircle>
                </MiddleCircle>
                <ArrowLeft color={colorGreen} />
            </Background>
            <Foreground>
                <Left>
                    <BowtieColumn headline="Structure" items={pickBarriers(structureBarriers)} />
                    <BowtieColumn headline="Containment" items={pickBarriers(containmentBarriers)} />
                    <BowtieColumn headline="Instr. Safety Systems" items={pickBarriers(safetySystemsBarriers)} />
                    <BowtieColumn headline="Ignition Control" items={pickBarriers(ignitionControlBarriers)} />
                </Left>
                <Right>
                    <BowtieColumn headline="Protection system" items={pickBarriers(protectionSystemBarriers)} />
                    <BowtieColumn headline="Power and communication" items={pickBarriers(powerAndCommunicationBarriers)} />
                    <BowtieColumn headline="Life saving" items={pickBarriers(lifeSavingBarriers)} />
                </Right>
            </Foreground>
            <MiddleText>
                <div>
                    <Typography style={{ marginBottom: '5px', width: '120px' }}>General Matters</Typography>
                    <BarrierSeverity items={pickBarriers(GMBarriers)} />
                </div>
            </MiddleText>
        </div>
    )
}

export default Bowtie
