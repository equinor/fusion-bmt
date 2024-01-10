import React from 'react'
import { Severity } from '../../api/models'
import { Radio } from '@equinor/eds-core-react'
import styled from 'styled-components'

const ColoredRadio = styled(Radio) <{ $color: string }>`
    .Radio__Svg-sc-we59oz-3.fGTcpM {
        fill: ${(props) => props.$color} !important;
    }
`


interface RadioButtonWrapperProps {
    label: string
    color: string
    disabled: boolean
    onClick: () => void
    isSelected: boolean
}

const RadioButtonWrapper = ({ label, color, disabled, onClick, isSelected }: RadioButtonWrapperProps) => {
    return (
        <>
            <label style={{ display: 'flex', alignItems: 'center' }}>
                <ColoredRadio $color={color} onChange={onClick}  disabled={disabled} checked={isSelected} />
                {label}
            </label>
        </>
    )
}

interface AnswerSeverityFormProps {
    severity: Severity
    disabled: boolean
    onSeveritySelected: (severity: Severity) => void
}

const AnswerSeverityForm = ({ severity, disabled, onSeveritySelected }: AnswerSeverityFormProps) => {
    return (
        <>
            <RadioButtonWrapper
                label="On track"
                color="green"
                onClick={() => onSeveritySelected(Severity.OnTrack)}
                isSelected={severity === Severity.OnTrack}
                disabled={disabled}
            />
            <RadioButtonWrapper
                label="Some concerns"
                color="orange"
                onClick={() => onSeveritySelected(Severity.SomeConcerns)}
                isSelected={severity === Severity.SomeConcerns}
                disabled={disabled}
            />
            <RadioButtonWrapper
                label="Major issues"
                color="red"
                onClick={() => onSeveritySelected(Severity.MajorIssues)}
                isSelected={severity === Severity.MajorIssues}
                disabled={disabled}
            />
            <RadioButtonWrapper
                label="N/A"
                color="gray"
                onClick={() => onSeveritySelected(Severity.Na)}
                isSelected={severity === Severity.Na}
                disabled={disabled}
            />
        </>
    )
}

export default AnswerSeverityForm
