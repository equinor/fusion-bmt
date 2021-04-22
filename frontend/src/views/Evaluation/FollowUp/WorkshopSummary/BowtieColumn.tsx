import React from 'react'
import { Typography } from '@equinor/eds-core-react'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import { countSeverities } from '../../../../utils/Severity'
import SeverityColors from '../../../../components/SeverityColors'

interface Props {
    headline: string
    items: AnswersWithBarrier[]
}

const BowtieColumn = ({ headline, items }: Props) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '10px', height: '200px', marginTop: '75px' }}>
            <Typography style={{ marginBottom: '10px', height: '2rem' }}>{headline}</Typography>
            {Object.values(items).map(({ barrier, answers }) => {
                const severityCount = countSeverities(answers)
                return (
                    <div key={barrier} style={{ padding: '2px' }}>
                        <SeverityColors key={barrier} barrier={barrier} severityCount={severityCount} />
                    </div>
                )
            })}
        </div>
    )
}

export default BowtieColumn
