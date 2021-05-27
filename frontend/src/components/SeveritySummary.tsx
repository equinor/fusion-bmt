import React from 'react'
import styled from 'styled-components'
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
            <Box display="flex" alignItems="center" bgcolor={getBGColor(severity)} p={1} borderRadius={4} width="50px">
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

const ClickableBox = styled(Box)<{ hasClickHandler: boolean; selected?: boolean }>`
    cursor: ${props => (props.hasClickHandler ? 'pointer' : 'default')};
    border: ${props => (props.selected ? '1px solid ' + props.color : '1px solid transparent')};
    border-radius: 4px;
`

interface Props {
    severityCount: SeverityCount
    compact?: boolean
    onClick?: (severity: Severity) => void
    severityFilter?: Severity[]
}

const SeveritySummary = ({ severityCount, compact = false, onClick, severityFilter }: Props) => {
    const { nHigh, nLimited, nLow, nNA } = severityCount
    const spacing = compact ? 0 : 1

    const onClickedSeverity = (severity: Severity) => {
        if (onClick !== undefined) {
            onClick(severity)
        }
    }

    const isSelected = (severity: Severity) => {
        return severityFilter && severityFilter.includes(severity)
    }

    return (
        <>
            <Box display="flex">
                <ClickableBox
                    flexGrow={1}
                    mx={spacing / 2}
                    onClick={() => onClickedSeverity(Severity.High)}
                    hasClickHandler={onClick !== undefined}
                    selected={isSelected(Severity.High)}
                    color={getTextColor(Severity.High)}
                >
                    <SeveritySummaryField num={nHigh} severity={Severity.High} compact={compact} />
                </ClickableBox>
                <ClickableBox
                    flexGrow={1}
                    mx={spacing / 2}
                    onClick={() => onClickedSeverity(Severity.Limited)}
                    hasClickHandler={onClick !== undefined}
                    selected={isSelected(Severity.Limited)}
                    color={getTextColor(Severity.Limited)}
                >
                    <SeveritySummaryField num={nLimited} severity={Severity.Limited} compact={compact} />
                </ClickableBox>
                <ClickableBox
                    flexGrow={1}
                    mx={spacing / 2}
                    onClick={() => onClickedSeverity(Severity.Low)}
                    hasClickHandler={onClick !== undefined}
                    selected={isSelected(Severity.Low)}
                    color={getTextColor(Severity.Low)}
                >
                    <SeveritySummaryField num={nLow} severity={Severity.Low} compact={compact} />
                </ClickableBox>
                <ClickableBox
                    flexGrow={1}
                    mx={spacing / 2}
                    onClick={() => onClickedSeverity(Severity.Na)}
                    hasClickHandler={onClick !== undefined}
                    selected={isSelected(Severity.Na)}
                    color={getTextColor(Severity.Na)}
                >
                    <SeveritySummaryField num={nNA} severity={Severity.Na} compact={compact} />
                </ClickableBox>
            </Box>
        </>
    )
}

export default SeveritySummary
