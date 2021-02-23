import React from 'react'
import { Box } from '@material-ui/core'
import { Typography } from '@equinor/eds-core-react'
import Bowtie from './Bowtie'
import { AnswersWithBarrier } from '../../../../utils/Variables'

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
                <Bowtie answersWithBarrier={answersWithBarrier} />
            </Box>
        </>
    )
}

export default BowtieView
