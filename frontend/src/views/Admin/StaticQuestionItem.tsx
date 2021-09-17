import React from 'react'
import { Chip, EditIcon, MarkdownViewer, MoreIcon } from '@equinor/fusion-components'
import { Typography } from '@equinor/eds-core-react'
import { tokens } from '@equinor/eds-tokens'
import { Box } from '@material-ui/core'

import { QuestionTemplate } from '../../api/models'
import { organizationToString } from '../../utils/EnumToString'

interface Props {
    question: QuestionTemplate
    setIsInEditmode: (inEditmode: boolean) => void
}

const StaticQuestionItem = ({ question, setIsInEditmode }: Props) => {
    return (
        <Box display="flex" flexDirection="row">
            <Box display="flex" flexGrow={1} mb={3} mr={22}>
                <Box ml={2} mr={1}>
                    <Typography variant="h4">{question.order}.</Typography>
                </Box>
                <Box>
                    <Typography variant="h4">{question.text}</Typography>
                    <div style={{ marginBottom: 20, marginTop: 5 }}>
                        <Chip primary title={organizationToString(question.organization)} />
                    </div>
                    <MarkdownViewer markdown={question.supportNotes} />
                </Box>
            </Box>
            <Box mr={2} onClick={() => setIsInEditmode(true)}>
                <EditIcon cursor="pointer" color={tokens.colors.interactive.primary__resting.rgba} />
            </Box>
            <Box>
                <MoreIcon cursor="pointer" color={tokens.colors.interactive.primary__resting.rgba} />
            </Box>
        </Box>
    )
}

export default StaticQuestionItem
