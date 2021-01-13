import React from 'react'

import { Box } from '@material-ui/core'

import { Severity } from '../api/models'
import SeverityIndicator, { getBGColor, getTextColor, SeverityIndicatorWithNumber } from './SeverityIndicator'
import { Typography } from '@equinor/eds-core-react'
import { SeverityCount } from '../utils/Severity'

interface SeveritySummaryFieldProps {
    num: number
    severity: Severity
}

const CompactSeveritySummaryField = ({ num, severity }: SeveritySummaryFieldProps) => {
    return (
        <>
            <SeverityIndicatorWithNumber num={num} severity={severity} />
        </>
    )
}

const LargeSeveritySummaryField = ({ num, severity }: SeveritySummaryFieldProps) => {
    return (
        <>
            <Box display="flex" alignItems="center" bgcolor={getBGColor(severity)} p={1} borderRadius={4} width="fit-content">
                <Box mr={0.5}>
                    <SeverityIndicator severity={severity} />
                </Box>
                <Box>
                    <Typography variant="caption" color={getTextColor(severity)}>
                        {num}
                    </Typography>
                </Box>
            </Box>
        </>
    )
}

interface CompactableSeveritySummaryFieldProps extends SeveritySummaryFieldProps {
    compact?: boolean
}

const SeveritySummaryField = ({ num, severity, compact = false }: CompactableSeveritySummaryFieldProps) => {
    if (compact) {
        return <CompactSeveritySummaryField num={num} severity={severity} />
    } else {
        return <LargeSeveritySummaryField num={num} severity={severity} />
    }
}

interface Props {
    severityCount: SeverityCount
    compact?: boolean
}

const SeveritySummary = ({ severityCount, compact = false }: Props) => {
    const { nHigh, nLimited, nLow, nNA } = severityCount
    const spacing = compact ? 0 : 1
    return (
        <>
            <Box display="flex">
                <Box flexGrow={1} mx={spacing / 2}>
                    <SeveritySummaryField num={nLow} severity={Severity.Low} compact={compact} />
                </Box>
                <Box flexGrow={1} mx={spacing / 2}>
                    <SeveritySummaryField num={nLimited} severity={Severity.Limited} compact={compact} />
                </Box>
                <Box flexGrow={1} mx={spacing / 2}>
                    <SeveritySummaryField num={nHigh} severity={Severity.High} compact={compact} />
                </Box>
                <Box flexGrow={1} mx={spacing / 2}>
                    <SeveritySummaryField num={nNA} severity={Severity.Na} compact={compact} />
                </Box>
            </Box>
        </>
    )
}

export default SeveritySummary
