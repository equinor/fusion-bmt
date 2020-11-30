import React from 'react'
import { cleanup, fireEvent } from '@testing-library/react'

import { renderWithContext } from '../utils/FusionTestWrapper'

import ProgressEvaluationDialog from './ProgressEvaluationDialog'
import { Progression } from '../api/models'


afterEach(cleanup)

describe('ProgressEvaluationDialog', () => {
    it('Call on click', () => {
        const onConfirm = jest.fn()
        const onCancel = jest.fn()

        const { getByText } = renderWithContext(
            <ProgressEvaluationDialog
                isOpen={true}
                currentProgression={Progression.Nomination}
                onConfirmClick={onConfirm}
                onCancelClick={onCancel}
            />
        )

        const cancelButton = getByText('No')
        const confirmButton = getByText('Yes')

        fireEvent.click(cancelButton)
        fireEvent.click(confirmButton)

        expect(onCancel).toHaveBeenCalledTimes(1)
        expect(onConfirm).toHaveBeenCalledTimes(1)
    })
})
