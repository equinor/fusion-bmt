import React from 'react'
import { Box } from '@material-ui/core'
import { Typography } from '@equinor/eds-core-react'
import Bowtie from './Bowtie'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import styled from 'styled-components'

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
}

const BowtieView = ({ answersWithBarrier }: Props) => {
    return (
        <>
            <Box p="20px">
                <Typography variant="h2" style={{ marginBottom: '30px' }}>
                    Bowtie model
                </Typography>
                <ScrollableDiv>
                    <Bowtie answersWithBarrier={answersWithBarrier} />
                </ScrollableDiv>
            </Box>
        </>
    )
}

export default BowtieView
