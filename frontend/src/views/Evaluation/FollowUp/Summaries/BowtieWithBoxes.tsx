import React from 'react'
import { Typography } from '@equinor/eds-core-react'
import styled from 'styled-components'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import BarrierSeverity from './BarrierSeverity'
import BarrierCard from './BarrierCard'
import TopEventIllustration from './TopEventIllustration'
import Arrow from './Arrow'

const EXTRA_CARD_WIDTH_TO_MAKE_SYMMETRIC = 65

const Bowtie = styled.div`
    margin: 50px 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
`

const MiddleText = styled.div`
    position: relative;
    left: 810px;
    bottom: 60px;
    width: 100px;

    @media (max-width: 1800px) {
        left: 720px;
    }
`

interface Props {
    answersWithBarrier: AnswersWithBarrier[]
}

const BowtieWithBoxes = ({ answersWithBarrier }: Props) => {
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
        <div style={{ marginBottom: '50px' }}>
            <Bowtie>
                <BarrierCard index={0} headline="Structure" items={pickBarriers(structureBarriers)} />
                <BarrierCard index={1} headline="Containment" items={pickBarriers(containmentBarriers)} />
                <BarrierCard index={2} headline="Instr. Safety Systems" items={pickBarriers(safetySystemsBarriers)} />
                <BarrierCard index={3} headline="Ignition Control" items={pickBarriers(ignitionControlBarriers)} />
                <TopEventIllustration />
                <BarrierCard
                    index={3}
                    headline="Protection system"
                    items={pickBarriers(protectionSystemBarriers)}
                    isRight
                    extraWidth={EXTRA_CARD_WIDTH_TO_MAKE_SYMMETRIC}
                />
                <BarrierCard
                    index={2}
                    headline="Power and communication"
                    items={pickBarriers(powerAndCommunicationBarriers)}
                    isRight
                    extraWidth={EXTRA_CARD_WIDTH_TO_MAKE_SYMMETRIC}
                />
                <BarrierCard
                    index={1}
                    headline="Life saving"
                    items={pickBarriers(lifeSavingBarriers)}
                    isRight
                    extraWidth={EXTRA_CARD_WIDTH_TO_MAKE_SYMMETRIC}
                />
            </Bowtie>
            <MiddleText>
                <div>
                    <Typography style={{ marginBottom: '5px', width: '120px' }}>General Matters</Typography>
                    <BarrierSeverity items={pickBarriers(GMBarriers)} />
                </div>
            </MiddleText>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <Arrow text={'Probability Reducing'}></Arrow>
                <Arrow text={'Consequence Reducing'} placementRight></Arrow>
            </div>
        </div>
    )
}

export default BowtieWithBoxes
