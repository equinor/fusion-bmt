import { Box } from '@mui/material'
import { Button, Icon, Tooltip } from '@equinor/eds-core-react'
import { copy, delete_to_trash, edit } from '@equinor/eds-icons'

import { QuestionTemplate } from '../../../../api/models'

interface Props {
    question: QuestionTemplate
    setIsInEditmode: (val: boolean) => void
    setQuestionTemplateToCopy: (val: QuestionTemplate) => void
    setIsAddingQuestion: (val: boolean) => void
    setIsInConfirmDeleteMode: (val: boolean) => void
}

const QuestionTemplateButtons = ({
    question,
    setIsInEditmode,
    setQuestionTemplateToCopy,
    setIsAddingQuestion,
    setIsInConfirmDeleteMode,
}: Props) => {
    const onClickCopy = () => {
        window.scroll(0, 0)
        setIsAddingQuestion(true)
        setQuestionTemplateToCopy(question)
    }

    return (
        <Box flexGrow={1} style={{ minWidth: '175px' }}>
            <Tooltip placement="bottom" title="Edit question">
                <Button
                    variant="ghost"
                    color="primary"
                    onClick={() => setIsInEditmode(true)}
                    data-testid={'edit-question-' + question.adminOrder}
                >
                    <Icon data={edit}></Icon>
                </Button>
            </Tooltip>
            <Tooltip placement="bottom" title="Copy question">
                <Button variant="ghost" color="primary" onClick={() => onClickCopy()} data-testid={'copy-question-' + question.adminOrder}>
                    <Icon data={copy}></Icon>
                </Button>
            </Tooltip>
            <Tooltip placement="bottom" title="Delete question">
                <Button
                    variant="ghost"
                    color="primary"
                    onClick={() => setIsInConfirmDeleteMode(true)}
                    data-testid={'delete-question-' + question.adminOrder}
                >
                    <Icon data={delete_to_trash}></Icon>
                </Button>
            </Tooltip>
        </Box>
    )
}

export default QuestionTemplateButtons
