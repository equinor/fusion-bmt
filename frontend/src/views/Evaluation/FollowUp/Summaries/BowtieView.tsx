import React from 'react'
import { Box } from '@material-ui/core'
import { Typography } from '@equinor/eds-core-react'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import styled from 'styled-components'
import BowtieWithBoxes from './BowtieWithBoxes'

const ScrollableDiv = styled.div`
    justify-content: center;
    display: flex;
    min-width: 1000px;
    overflow-x: scroll;

    @media (max-width: 1600px) {
        justify-content: left;
    }
`

interface Props {
    answersWithBarrier: AnswersWithBarrier[]
    workshopCompleted?: string
}

const BowtieView = ({ answersWithBarrier, workshopCompleted }: Props) => {
    return (
        <>
            <Box p="20px">
                <Typography variant="h2" style={{ marginBottom: '30px', marginLeft: '30px' }}>
                    Bowtie model
                </Typography>
                {workshopCompleted && (
                    <Typography style={{ marginTop: '-20px', marginLeft: '30px' }}>
                        Workshop completed: {new Date(workshopCompleted).toLocaleDateString()}
                    </Typography>
                )}
                <ScrollableDiv>
                    <BowtieWithBoxes answersWithBarrier={answersWithBarrier} />
                </ScrollableDiv>
            </Box>
        </>
    )
}

export default BowtieView
