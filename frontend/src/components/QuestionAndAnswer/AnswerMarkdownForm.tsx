import { MarkdownEditor } from '@equinor/fusion-components'
import { Box } from '@material-ui/core'
import React from 'react'

interface Props {
    markdown: string
    disabled: boolean
    onMarkdownChange: (markdown: string) => void
}

const AnswerMarkdownForm = ({ markdown, disabled, onMarkdownChange }: Props) => {
    const onLocalMarkdownChange = (markdown: string) => {
        if(!disabled){
            onMarkdownChange(markdown)
        }
    }

    // Using `disabled` to ensure that function using it is recreated on value change.
    // Not sure why it is necessary.
    return <>
        <Box width="100%" key={`${disabled}`}>
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
