import React from 'react'
import { SeverityCount } from '../utils/Severity'
import SeverityIndicator from './SeverityIndicator'
import { Barrier, Severity } from '../api/models'
import { barrierToString } from '../utils/EnumToString'
import { Tooltip, Typography } from '@equinor/eds-core-react'
import { selectSeverity } from './helpers'

interface Props {
    severityCount: SeverityCount
    barrier: Barrier
    alternativeText?: string
}

const SeverityColors = ({ severityCount, barrier, alternativeText }: Props) => {
    const severity = selectSeverity(severityCount)

    return (
        <div style={{ display: 'flex' }}>
            {severity !== Severity.Na && <SeverityIndicator severity={severity} />}
            <Tooltip title={barrierToString(barrier)} placement="bottom">
                <Typography
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px',
                    }}
                >
                    {alternativeText ? alternativeText : barrier}
                </Typography>
            </Tooltip>
        </div>
    )
}

export default SeverityColors
