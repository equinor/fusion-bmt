import React from 'react'
import { render, cleanup, screen, fireEvent } from '@testing-library/react'
import AnswerSeverityForm from './AnswerSeverityForm'
import { Severity } from '../../api/models'

afterEach(cleanup)

describe('AnswerSeverityForm', () => {
    it('Call on click', () => {
        const handleClick = jest.fn()

        render(
            <AnswerSeverityForm
                severity={Severity.HIGH}
                onSeveritySelected={handleClick}
            />
        )

        const severityForm = screen.queryByText('Limited') as HTMLElement

        fireEvent.click(severityForm)

        expect(handleClick).toHaveBeenCalledTimes(1)
    })
})
