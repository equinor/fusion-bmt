import React from 'react'

import { Icon } from '@equinor/eds-core-react'
import {
    radio_button_selected
} from '@equinor/eds-icons'

import { Severity } from '../api/models'

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

    return <>
        <Icon
            data={radio_button_selected}
            color={getColor(severity)}
        />
    </>
}

export default SeverityIndicator
