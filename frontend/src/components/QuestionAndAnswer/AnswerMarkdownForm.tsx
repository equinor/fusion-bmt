import { MarkdownEditor } from '@equinor/fusion-components'
import { Box } from '@material-ui/core'
import React from 'react'

interface AnswerMarkdownFormProps {
    markdown: string
    disabled: boolean
    onMarkdownChange: (markdown: string) => void
}

const AnswerMarkdownForm = ({ markdown, disabled, onMarkdownChange }: AnswerMarkdownFormProps) => {
    const onLocalMarkdownChange = (markdown: string) => {
        if(!disabled){
            onMarkdownChange(markdown)
        }
    }

    return <>
        <Box width="100%">
            <MarkdownEditor
                onChange={(markdown) => onLocalMarkdownChange(markdown)}
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
