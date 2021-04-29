import React from 'react'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import { countSeverities } from '../../../../utils/Severity'
import SeverityColors from '../../../../components/SeverityColors'

interface Props {
    items: AnswersWithBarrier[]
}

const BarrierSeverity = ({ items }: Props) => {
    return (
        <>
            {Object.values(items).map(({ barrier, answers }) => {
                const severityCount = countSeverities(answers)
                return (
                    <div key={barrier} style={{ padding: '2px' }}>
                        <SeverityColors key={barrier} barrier={barrier} severityCount={severityCount} />
                    </div>
                )
            })}
        </>
    )
}

export default BarrierSeverity
