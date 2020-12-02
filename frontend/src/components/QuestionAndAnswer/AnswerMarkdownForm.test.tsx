import React from 'react'
import { cleanup, fireEvent } from '@testing-library/react'
import { renderWithContext } from '../../utils/FusionTestWrapper'
import AnswerMarkdownForm from './AnswerMarkdownForm'

afterEach(cleanup)

describe('AnswerMarkdownForm', () => {
    it('Enabled', () => {
        const onMarkdownChange = jest.fn()

        const { getByText } = renderWithContext(
            <AnswerMarkdownForm
                markdown='Some text'
                disabled={false}
                onMarkdownChange={onMarkdownChange}
            />
        )

        const markdownTextField = getByText('Some text')

        fireEvent.change(markdownTextField)

        expect(onMarkdownChange).toHaveBeenCalledTimes(1)
    })
    it('Disabled', () => {
        const onMarkdownChange = jest.fn()

        const { getByText } = renderWithContext(
            <AnswerMarkdownForm
                markdown='Some text'
                disabled={true}
                onMarkdownChange={onMarkdownChange}
            />
        )

        const markdownTextField = getByText('Some text')

        fireEvent.change(markdownTextField)

        expect(onMarkdownChange).toHaveBeenCalledTimes(0)
    })
})
