import { Severity } from '../api/models'
import React from 'react'
import { RadioButton } from '@equinor/fusion-components'

interface SeverityIndicatorProps
{
    severity: Severity
}

const SeverityIndicator = ({severity}: SeverityIndicatorProps) => {
    const getColor = (severity: Severity) => {
        switch (severity) {
        case Severity.High:
            return 'green'
        case Severity.Limited:
            return 'orange'
        case Severity.Low:
            return 'red'
        case Severity.Na:
            return 'gray'
        }
    }

    return (
        <label style={{ display: 'flex', alignItems: 'center' }}>
            <RadioButton
                color={getColor(severity)}
                selected={true}
                disabled={true}
            />
        </label>
    )
}

export default SeverityIndicator
