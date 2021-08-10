import React from 'react'
import { AnswersWithBarrier } from '../../utils/Variables'
import styled from 'styled-components'
import SeverityList from './SeverityList'
import SimpleBarrierCard from './SimpleBowtie/SimpleBarrierCard'
import SimpleTopEvent from './SimpleBowtie/SimpleTopEvent'
import TopEventIllustration from './NormalBowtie/TopEventIllustration'
import DetailedBarrierCard from './NormalBowtie/DetailedBarrierCard'
import Arrow from './NormalBowtie/Arrow'

const EXTRA_CARD_WIDTH_TO_MAKE_SYMMETRIC = 65
const EXTRA_CARD_WIDTH_TO_MAKE_SYMMETRIC_SMALL = 15

export const Wrapper = styled.div<{ isDense: boolean }>`
    margin-bottom: ${props => (props.isDense ? '0' : '30px')};
    display: flex;
    flex-direction: column;
`

export const BowtieComponent = styled.div<{ isDense: boolean }>`
    margin: ${props => (props.isDense ? '20px 5px' : '50px 20px')};
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
`

export const MiddleTextWrapper = styled.div`
    position: relative;
    left: 790px;
    bottom: 60px;
    width: 150px;

    @media (max-width: 1800px) {
        left: 650px;
    }
`

export const MiddleDotWrapper = styled.div`
    position: relative;
    left: 205px;
    bottom: 35px;
    width: 20px;
`

interface BarrierCardProps {
    index: number
    barriers: string[]
    headline: string
    isRight?: boolean
}

interface Props {
    answersWithBarrier: AnswersWithBarrier[]
    isDense?: boolean
}

const Bowtie = ({ answersWithBarrier, isDense = false }: Props) => {
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

    const BarrierCard = ({ index, barriers, headline, isRight = false }: BarrierCardProps) => {
        if (isDense) {
            return (
                <SimpleBarrierCard
                    index={index}
                    items={pickBarriers(barriers)}
                    isRight={isRight}
                    extraWidth={isRight ? EXTRA_CARD_WIDTH_TO_MAKE_SYMMETRIC_SMALL : 0}
                />
            )
        }
        return (
            <DetailedBarrierCard
                index={index}
                items={pickBarriers(barriers)}
                headline={headline}
                isRight={isRight}
                extraWidth={isRight ? EXTRA_CARD_WIDTH_TO_MAKE_SYMMETRIC : 0}
            />
        )
    }

    const Middle = () => {
        if (isDense) {
            return <SimpleTopEvent />
        }
        return <TopEventIllustration />
    }

    const MiddleText = () => {
        if (isDense) {
            return (
                <MiddleDotWrapper>
                    <SeverityList items={pickBarriers(GMBarriers)} alternativeText={'General Matters'} isDense />
                </MiddleDotWrapper>
            )
        }
        return (
            <MiddleTextWrapper>
                <SeverityList items={pickBarriers(GMBarriers)} alternativeText={'General Matters'} />
            </MiddleTextWrapper>
        )
    }

    const BottomArrow = () => {
        if (isDense) {
            return <></>
        }
        return (
            <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <Arrow text={'Probability Reducing'}></Arrow>
                <Arrow text={'Consequence Reducing'} placementRight></Arrow>
            </div>
        )
    }

    return (
        <Wrapper isDense={isDense}>
            <BowtieComponent isDense={isDense}>
                <BarrierCard index={0} barriers={structureBarriers} headline="Structure" />
                <BarrierCard index={1} barriers={containmentBarriers} headline="Containment" />
                <BarrierCard index={2} barriers={safetySystemsBarriers} headline="Instr. Safety Systems" />
                <BarrierCard index={3} barriers={ignitionControlBarriers} headline="Ignition Control" />
                <Middle />
                <BarrierCard index={3} barriers={protectionSystemBarriers} headline="Protection system" isRight />
                <BarrierCard index={2} barriers={powerAndCommunicationBarriers} headline="Power and communication" isRight />
                <BarrierCard index={1} barriers={lifeSavingBarriers} headline="Life saving" isRight />
            </BowtieComponent>
            <MiddleText />
            <BottomArrow />
        </Wrapper>
    )
}

export default Bowtie
