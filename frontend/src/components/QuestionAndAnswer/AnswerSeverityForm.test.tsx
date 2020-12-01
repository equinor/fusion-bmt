import React from 'react'
import { cleanup, fireEvent } from '@testing-library/react'
import AnswerSeverityForm from './AnswerSeverityForm'
import { Severity } from '../../api/models'
import { renderWithContext } from '../../utils/FusionTestWrapper'

afterEach(cleanup)

describe('AnswerSeverityForm', () => {
    it('Call on click', () => {
        const onSeveritySelected = jest.fn()

        const { getByLabelText } = renderWithContext(
            <AnswerSeverityForm
                severity={Severity.High}
                disabled={false}
                onSeveritySelected={onSeveritySelected}
            />
        )

        const severityFormRadio = getByLabelText('Limited')

        fireEvent.click(severityFormRadio)

        expect(onSeveritySelected).toHaveBeenCalledTimes(1)
    })
    it('Disabled', () => {
        const onSeveritySelected = jest.fn()

        const { getByLabelText } = renderWithContext(
            <AnswerSeverityForm
                severity={Severity.High}
                disabled={true}
                onSeveritySelected={onSeveritySelected}
            />
        )

        const severityFormRadio = getByLabelText('Limited')

        fireEvent.click(severityFormRadio)

        expect(onSeveritySelected).toHaveBeenCalledTimes(0)
    })
})
