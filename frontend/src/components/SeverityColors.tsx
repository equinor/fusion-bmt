import React from 'react'
import { SeverityCount } from '../utils/Severity'
import SeverityIndicator from './SeverityIndicator'
import { Barrier, Severity } from '../api/models'
import { barrierToString } from '../utils/EnumToString'
import { Tooltip, Typography } from '@equinor/eds-core-react'

interface Props {
    severityCount: SeverityCount
    barrier: Barrier
}

const SeverityColors = ({ severityCount, barrier }: Props) => {
    const hasLowSeverity = severityCount.nLow > 0
    const hasLimitedSeverity = severityCount.nLimited > 0
    const hasHighSeverity = severityCount.nHigh > 0

    return (
        <div style={{ display: 'flex' }}>
            {!hasLowSeverity && !hasLimitedSeverity && hasHighSeverity && <SeverityIndicator severity={Severity.High} />}
            {!hasLowSeverity && hasLimitedSeverity && <SeverityIndicator severity={Severity.Limited} />}
            {hasLowSeverity && <SeverityIndicator severity={Severity.Low} />}
            <Tooltip title={barrierToString(barrier)} placement="bottom">
                <Typography
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px',
                    }}
                >
                    {barrier}
                </Typography>
            </Tooltip>
        </div>
    )
}

export default SeverityColors
