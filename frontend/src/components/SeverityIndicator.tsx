import React from 'react'

import { Icon, Typography } from '@equinor/eds-core-react'
import { radio_button_selected, radio_button_unselected } from '@equinor/eds-icons'
import { tokens } from '@equinor/eds-tokens'
import styled from 'styled-components'
import { Severity } from '../api/models'

const NumberOverlay = styled.div < { $color: string } > `
    position: absolute;
    left: 35%;
    top: 17%;
    
`;

const Wrapper = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
`;
export const getColor = (severity: Severity) => {
    switch (severity) {
        case Severity.OnTrack:
            return tokens.colors.interactive.success__resting.rgba
        case Severity.SomeConcerns:
            return tokens.colors.interactive.warning__resting.rgba
        case Severity.MajorIssues:
            return tokens.colors.interactive.danger__resting.rgba
        case Severity.Na:
            return tokens.colors.ui.background__scrim.rgba
    }
}

export const getTextColor = (severity: Severity) => {
    switch (severity) {
        case Severity.OnTrack:
            return tokens.colors.interactive.success__text.rgba
        case Severity.SomeConcerns:
            return tokens.colors.interactive.warning__text.rgba
        case Severity.MajorIssues:
            return tokens.colors.interactive.danger__text.rgba
        case Severity.Na:
            return tokens.colors.ui.background__overlay.rgba
    }
}

export const getBGColor = (severity: Severity) => {
    switch (severity) {
        case Severity.OnTrack:
            return tokens.colors.interactive.success__highlight.rgba
        case Severity.SomeConcerns:
            return tokens.colors.interactive.warning__highlight.rgba
        case Severity.MajorIssues:
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
    return (
        <div
            style={{ justifyContent: 'center', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getColor(severity) }}
        ></div>
    )
}

interface SeverityIndicatorWithNumberProps {
    severity: Severity
    num: number
}

export const SeverityIndicatorWithNumber = ({ num, severity }: SeverityIndicatorWithNumberProps) => {
    return (
        <>
            <Wrapper>
                <div
                    style={{
                        gridArea: 'inners',
                    }}
                >
                    <Icon data={radio_button_unselected} color={getColor(severity)} />
                </div>
                <NumberOverlay $color={getTextColor(severity)}>
                    <Typography
                        color={getTextColor(severity)}
                        token={{
                            fontSize: '0.7rem',
                        }}
                    >
                        {num}
                    </Typography>
                </NumberOverlay>
            </Wrapper>
        </>
    )
}

export default SeverityIndicator
