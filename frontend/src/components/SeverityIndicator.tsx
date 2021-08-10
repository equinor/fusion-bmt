import React from 'react'

import { Icon, Typography } from '@equinor/eds-core-react'
import { radio_button_selected, radio_button_unselected } from '@equinor/eds-icons'
import { tokens } from '@equinor/eds-tokens'

import { Severity } from '../api/models'

export const getColor = (severity: Severity) => {
    switch (severity) {
        case Severity.High:
            return tokens.colors.interactive.success__resting.rgba
        case Severity.Limited:
            return tokens.colors.interactive.warning__resting.rgba
        case Severity.Low:
            return tokens.colors.interactive.danger__resting.rgba
        case Severity.Na:
            return tokens.colors.ui.background__scrim.rgba
    }
}

export const getTextColor = (severity: Severity) => {
    switch (severity) {
        case Severity.High:
            return tokens.colors.interactive.success__text.rgba
        case Severity.Limited:
            return tokens.colors.interactive.warning__text.rgba
        case Severity.Low:
            return tokens.colors.interactive.danger__text.rgba
        case Severity.Na:
            return tokens.colors.ui.background__overlay.rgba
    }
}

export const getBGColor = (severity: Severity) => {
    switch (severity) {
        case Severity.High:
            return tokens.colors.interactive.success__highlight.rgba
        case Severity.Limited:
            return tokens.colors.interactive.warning__highlight.rgba
        case Severity.Low:
            return tokens.colors.interactive.danger__highlight.rgba
        case Severity.Na:
            return tokens.colors.ui.background__medium.rgba
    }
}

interface SeverityIndicatorProps {
    severity: Severity
}

const SeverityIndicator = ({ severity }: SeverityIndicatorProps) => {
    return (
        <>
            <Icon data={radio_button_selected} color={getColor(severity)} />
        </>
    )
}

export const SmallSeverityIndicator = ({ severity }: SeverityIndicatorProps) => {
    return <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getColor(severity) }}></div>
}

interface SeverityIndicatorWithNumberProps {
    severity: Severity
    num: number
}

export const SeverityIndicatorWithNumber = ({ num, severity }: SeverityIndicatorWithNumberProps) => {
    return (
        <>
            <div
                style={{
                    display: 'grid',
                    placeItems: 'center',
                    gridTemplateAreas: 'inners',
                }}
            >
                <div
                    style={{
                        gridArea: 'inners',
                    }}
                >
                    <Icon data={radio_button_unselected} color={getColor(severity)} />
                </div>
                <div
                    style={{
                        gridArea: 'inners',
                    }}
                >
                    <Typography
                        color={getTextColor(severity)}
                        token={{
                            fontSize: '0.7rem',
                        }}
                    >
                        {num}
                    </Typography>
                </div>
            </div>
        </>
    )
}

export default SeverityIndicator
