import React from 'react'
import { SeverityCount } from '../utils/Severity'
import SeverityIndicator from './SeverityIndicator'
import { Barrier, Severity } from '../api/models'
import { barrierToString } from '../utils/EnumToString'
import { Typography } from '@equinor/eds-core-react'

interface Props {
    severityCount: SeverityCount
    barrier: Barrier
}

const HighSeveritySummary = ({ severityCount, barrier }: Props) => {
    const hasLowSeverity = severityCount.nLow > 0
    const hasLimitedSeverity = severityCount.nLimited > 0

    return (
        <div style={{ display: 'flex' }}>
            {hasLowSeverity && <SeverityIndicator severity={Severity.Low} />}
            {hasLimitedSeverity && <SeverityIndicator severity={Severity.Limited} />}
            <Typography
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '5px',
                }}
            >
                {barrierToString(barrier)}
            </Typography>
        </div>
    )
}

export default HighSeveritySummary
