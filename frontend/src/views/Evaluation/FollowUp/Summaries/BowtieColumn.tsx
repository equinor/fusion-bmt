import React from 'react'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import BarrierSeverity from './BarrierSeverity'
import { Typography } from '@equinor/eds-core-react'

interface Props {
    headline: string
    items: AnswersWithBarrier[]
}

const BowtieColumn = ({ headline, items }: Props) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '10px', height: '200px', marginTop: '75px' }}>
            <Typography style={{ marginBottom: '10px', height: '2rem' }}>{headline}</Typography>
            <BarrierSeverity items={items} />
        </div>
    )
}

export default BowtieColumn
