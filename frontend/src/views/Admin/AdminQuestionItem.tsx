import { Chip, EditIcon, MoreIcon } from '@equinor/fusion-components'
import { Divider, Typography } from '@equinor/eds-core-react'
import { tokens } from '@equinor/eds-tokens'
import { Box } from '@material-ui/core'

import { QuestionTemplate } from '../../api/models'
import { organizationToString } from '../../utils/EnumToString'

interface Props {
    question: QuestionTemplate
}

const AdminQuestionItem = ({ question }: Props) => {
    return (
        <div key={question.id} id={`question-${question.order}`}>
            <Divider />
            <Box display="flex" flexDirection="row">
                <Box display="flex" flexGrow={1} mb={3} mr={22}>
                    <Box ml={2} mr={1}>
                        <Typography variant="h4">{question.order}.</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h4">{question.text}</Typography>
                        <div style={{ marginBottom: 10 }}>
                            <Chip primary title={organizationToString(question.organization)} />
                        </div>
                        {question.supportNotes.split('\n').map(supportNotePart => {
                            return <Typography key={question.id + supportNotePart}>{supportNotePart}</Typography>
                        })}
                    </Box>
                </Box>
                <Box mr={2}>
                    <EditIcon cursor="pointer" color={tokens.colors.interactive.primary__resting.rgba} />
                </Box>
                <Box>
                    <MoreIcon cursor="pointer" color={tokens.colors.interactive.primary__resting.rgba} />
                </Box>
            </Box>
        </div>
    )
}

export default AdminQuestionItem
