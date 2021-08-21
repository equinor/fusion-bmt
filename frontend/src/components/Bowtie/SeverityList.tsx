import React from 'react'
import { AnswersWithBarrier } from '../../utils/Variables'
import { countSeverities } from '../../utils/Severity'
import SeverityListItem from './SeverityListItem'

interface Props {
    items: AnswersWithBarrier[]
    alternativeText?: string
    isDense?: boolean
}

const SeverityList = ({ items, alternativeText, isDense = false }: Props) => {
    return (
        <>
            {Object.values(items).map(({ barrier, answers }) => {
                const severityCount = countSeverities(answers)
                return (
                    <div key={barrier} style={{ padding: '2px' }}>
                        <SeverityListItem
                            key={barrier}
                            barrier={barrier}
                            severityCount={severityCount}
                            alternativeText={alternativeText}
                            isDense={isDense}
                        />
                    </div>
                )
            })}
        </>
    )
}

export default SeverityList
