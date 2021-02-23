import React from 'react'
import { Typography } from '@equinor/eds-core-react'
import styled from 'styled-components'
import { tokens } from '@equinor/eds-tokens'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import HighSeveritySummary from '../../../../components/HighSeveritySummary'
import { countSeverities } from '../../../../utils/Severity'

const Background = styled.div`
    display: flex;
    align-items: center;
    z-index: -1;
`

const Foreground = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    align-content: center;
    z-index: 1;
    height: 100%;
    width: 40%;
    padding-left: 2rem;
`

const Arrow = styled.div`
    width: 0;
    height: 0;
    border-top: 34vh solid transparent;
    border-bottom: 34vh solid transparent;
`

const ArrowRight = styled(Arrow)<{ color: string }>`
    border-left: 52vw solid ${props => props.color};
`

const ArrowLeft = styled(Arrow)<{ color: string }>`
    border-right: 52vw solid ${props => props.color};
`

const MiddleCircle = styled.div<{ color: string }>`
    width: 20vh;
    height: 20vh;
    background: ${props => props.color};
    border-radius: 50%;
    margin-left: -20vh;
    margin-right: -20vh;
    display: flex;
    align-items: center;
    justify-content: center;
`

const RedCircle = styled.div<{ color: string }>`
    width: 15vh;
    height: 15vh;
    background: ${props => props.color};
    border-radius: 50%;
    z-index: 0;
    display: flex;
    align-items: center;
    justify-content: center;
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
                {Object.values(answersWithBarrier).map(({ barrier, answers }) => {
                    const severityCount = countSeverities(answers)
                    const shouldShowBarrier = severityCount.nLow > 0 || severityCount.nLimited > 0

                    if (shouldShowBarrier) {
                        return (
                            <div key={barrier} style={{ padding: '2px' }}>
                                <HighSeveritySummary key={barrier} barrier={barrier} severityCount={severityCount} />
                            </div>
                        )
                    } else {
                        return <></>
                    }
                })}
            </Foreground>
        </div>
    )
}

export default Bowtie
