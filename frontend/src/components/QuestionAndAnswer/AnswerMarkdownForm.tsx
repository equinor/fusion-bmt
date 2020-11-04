import { MarkdownEditor } from '@equinor/fusion-components'
import { Box } from '@material-ui/core'
import React from 'react'

interface AnswerMarkdownFormProps {
    markdown: string
    onMarkdownChange: (markdown: string) => void
}

const AnswerMarkdownForm = ({ markdown, onMarkdownChange }: AnswerMarkdownFormProps) => {
    return <>
        <Box width="100%">
            <MarkdownEditor
                onChange={(markdown) => onMarkdownChange(markdown)}
                menuItems={[
                    'strong',
                    'em',
                    'bullet_list',
                    'ordered_list',
                    'blockquote',
                    'h1',
                    'h2',
                    'h3',
                    'paragraph'
                ]}
            >
                {markdown}
            </MarkdownEditor>
        </Box>
    </>
}

export default AnswerMarkdownForm
