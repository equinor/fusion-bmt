import React from 'react'
import styled from 'styled-components'
import { Box } from '@mui/material'
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

const ClickableBox = styled(Box)<{ $hasclickhandler: boolean; $selected?: boolean; $color: string }>`
    cursor: ${props => (props.$hasclickhandler ? 'pointer' : 'default')};
    border: ${props => (props.$selected ? '1px solid ' + props.$color : '1px solid transparent')};
    border-radius: 4px;
`

interface Props {
    severityCount: SeverityCount
    compact?: boolean
    onClick?: (severity: Severity) => void
    severityFilter?: Severity[]
}

const SeveritySummary = ({ severityCount, compact = false, onClick, severityFilter }: Props) => {
    const { nOnTrack, nSomeConcerns, nMajorIssues, nNA } = severityCount
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
                    onClick={() => onClickedSeverity(Severity.OnTrack)}
                    $hasclickhandler={onClick !== undefined}
                    $selected={isSelected(Severity.OnTrack)}
                    $color={getTextColor(Severity.OnTrack)}
                >
                    <SeveritySummaryField num={nOnTrack} severity={Severity.OnTrack} compact={compact} />
                </ClickableBox>
                <ClickableBox
                    flexGrow={1}
                    mx={spacing / 2}
                    onClick={() => onClickedSeverity(Severity.SomeConcerns)}
                    $hasclickhandler={onClick !== undefined}
                    $selected={isSelected(Severity.SomeConcerns)}
                    $color={getTextColor(Severity.SomeConcerns)}
                >
                    <SeveritySummaryField num={nSomeConcerns} severity={Severity.SomeConcerns} compact={compact} />
                </ClickableBox>
                <ClickableBox
                    flexGrow={1}
                    mx={spacing / 2}
                    onClick={() => onClickedSeverity(Severity.MajorIssues)}
                    $hasclickhandler={onClick !== undefined}
                    $selected={isSelected(Severity.MajorIssues)}
                    $color={getTextColor(Severity.MajorIssues)}
                >
                    <SeveritySummaryField num={nMajorIssues} severity={Severity.MajorIssues} compact={compact} />
                </ClickableBox>
                <ClickableBox
                    flexGrow={1}
                    mx={spacing / 2}
                    onClick={() => onClickedSeverity(Severity.Na)}
                    $hasclickhandler={onClick !== undefined}
                    $selected={isSelected(Severity.Na)}
                    $color={getTextColor(Severity.Na)}
                >
                    <SeveritySummaryField num={nNA} severity={Severity.Na} compact={compact} />
                </ClickableBox>
            </Box>
        </>
    )
}

export default SeveritySummary
