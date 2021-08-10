import React from 'react'
import { SeverityCount } from '../utils/Severity'
import SeverityIndicator, { SmallSeverityIndicator } from './SeverityIndicator'
import { Barrier, Severity } from '../api/models'
import { barrierToString } from '../utils/EnumToString'
import { Tooltip, Typography } from '@equinor/eds-core-react'
import { selectSeverity } from './Bowtie/utils'

interface Props {
    severityCount: SeverityCount
    barrier: Barrier
    alternativeText?: string
    isSmall?: boolean
}

const SeverityColors = ({ severityCount, barrier, alternativeText, isSmall = false }: Props) => {
    const severity = selectSeverity(severityCount)
    const severityIndicator = isSmall ? <SmallSeverityIndicator severity={severity} /> : <SeverityIndicator severity={severity} />

    return (
        <div style={{ display: 'flex' }}>
            {severity !== Severity.Na && severityIndicator}
            {!isSmall && (
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
            )}
        </div>
    )
}

export default SeverityColors
