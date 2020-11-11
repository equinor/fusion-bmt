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
            onClick={() => onSeveritySelected(Severity.High)}
            isSelected={severity === Severity.High}
        />
        <RadioButtonWrapper
            label="Limited"
            color="orange"
            onClick={() => onSeveritySelected(Severity.Limited)}
            isSelected={severity === Severity.Limited}
        />
        <RadioButtonWrapper
            label="Low"
            color="red"
            onClick={() => onSeveritySelected(Severity.Low)}
            isSelected={severity === Severity.Low}
        />
        <RadioButtonWrapper
            label="N/A"
            color="gray"
            onClick={() => onSeveritySelected(Severity.Na)}
            isSelected={severity === Severity.Na}
        />
    </>
}

export default AnswerSeverityForm
