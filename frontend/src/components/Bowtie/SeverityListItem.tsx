import React from 'react'
import { Tooltip, Typography } from '@equinor/eds-core-react'
import SeverityIndicator, { SmallSeverityIndicator } from '../SeverityIndicator'
import styled from 'styled-components'
import { SeverityCount } from '../../utils/Severity'
import { Barrier, Severity } from '../../api/models'
import { selectSeverity } from './utils'
import { barrierToString } from '../../utils/EnumToString'

const TooltipText = styled(Typography)`
    display: flex;
    align-items: center;
    padding-top: 2px;
    padding-left: 5px;
`

interface Props {
    severityCount: SeverityCount
    barrier: Barrier
    alternativeText?: string
    isDense?: boolean
}

const SeverityListItem = ({ severityCount, barrier, alternativeText, isDense = false }: Props) => {
    const severity = selectSeverity(severityCount)
    const severityIndicator = isDense ? <SmallSeverityIndicator severity={severity} /> : <SeverityIndicator severity={severity} />

    return (
        <div style={{ display: 'flex' }}>
            {severity !== Severity.Na && severityIndicator}
            {!isDense && (
                <Tooltip title={barrierToString(barrier)} placement="bottom">
                    <TooltipText>{alternativeText ? alternativeText : barrier}</TooltipText>
                </Tooltip>
            )}
        </div>
    )
}

export default SeverityListItem
