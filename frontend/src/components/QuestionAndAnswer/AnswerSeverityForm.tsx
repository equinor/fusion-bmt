import { RadioButton } from '@equinor/fusion-components'
import React from 'react'
import { Severity } from '../../api/models'

interface RadioButtonWrapperProps {
    label: string
    color: string
    onClick: () => void
    isSelected: boolean
}

const RadioButtonWrapper = ({ label, color, onClick, isSelected }: RadioButtonWrapperProps) => {
    return <>
        <label style={{ display: 'flex', alignItems: 'center' }}>
            <RadioButton
                color={color}
                onChange={onClick}
                selected={isSelected}
            />
            {label}
        </label>
    </>
}

interface AnswerSeverityFormProps {
    severity: Severity
    onSeveritySelected: (severity: Severity) => void
}

const AnswerSeverityForm = ({ severity, onSeveritySelected }: AnswerSeverityFormProps) => {
    return <>
        <RadioButtonWrapper
            label="High"
            color="green"
            onClick={() => onSeveritySelected(Severity.HIGH)}
            isSelected={severity === Severity.HIGH}
        />
        <RadioButtonWrapper
            label="Limited"
            color="orange"
            onClick={() => onSeveritySelected(Severity.LIMITED)}
            isSelected={severity === Severity.LIMITED}
        />
        <RadioButtonWrapper
            label="Low"
            color="red"
            onClick={() => onSeveritySelected(Severity.LOW)}
            isSelected={severity === Severity.LOW}
        />
        <RadioButtonWrapper
            label="N/A"
            color="gray"
            onClick={() => onSeveritySelected(Severity.NA)}
            isSelected={severity === Severity.NA}
        />
    </>
}

export default AnswerSeverityForm
