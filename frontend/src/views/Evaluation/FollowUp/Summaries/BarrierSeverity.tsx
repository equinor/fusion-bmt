import React from 'react'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import { countSeverities } from '../../../../utils/Severity'
import SeverityColors from '../../../../components/SeverityColors'

interface Props {
    items: AnswersWithBarrier[]
    alternativeText?: string
}

const BarrierSeverity = ({ items, alternativeText }: Props) => {
    return (
        <>
            {Object.values(items).map(({ barrier, answers }) => {
                const severityCount = countSeverities(answers)
                return (
                    <div key={barrier} style={{ padding: '2px' }}>
                        <SeverityColors key={barrier} barrier={barrier} severityCount={severityCount} alternativeText={alternativeText} />
                    </div>
                )
            })}
        </>
    )
}

export default BarrierSeverity
