import { Button, Icon, Tooltip } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'
import { copy, delete_to_trash, edit } from '@equinor/eds-icons'

import { QuestionTemplate } from '../../../api/models'

interface Props {
    question: QuestionTemplate
    setIsInEditmode: (val: boolean) => void
    setQuestionTemplateToCopy: (val: QuestionTemplate) => void
    setIsCopyingQuestion: (val: boolean) => void
    setIsInConfirmDeleteMode: (val: boolean) => void
}

const QuestionTemplateButtons = ({ question, setIsInEditmode, setQuestionTemplateToCopy, setIsCopyingQuestion, setIsInConfirmDeleteMode }: Props) => {
    const onClickCopy = () => {
        window.scroll(0, 0)
        setIsCopyingQuestion(true)
        setQuestionTemplateToCopy(question)
    }

    return (
        <Box flexGrow={1} style={{ minWidth: '120px' }}>
            <Tooltip placement="bottom" title="Edit question">
                <Button
                    variant="ghost"
                    color="primary"
                    onClick={() => setIsInEditmode(true)}
                    data-testid={'edit-question-' + question.order}
                >
                    <Icon data={edit}></Icon>
                </Button>
            </Tooltip>
            <Tooltip placement="bottom" title="Copy question">
                <Button variant="ghost" color="primary" onClick={() => onClickCopy()}>
                    <Icon data={copy}></Icon>
                </Button>
            </Tooltip>
            <Tooltip placement="bottom" title="Delete question">
                <Button
                    variant="ghost"
                    color="primary"
                    onClick={() => setIsInConfirmDeleteMode(true)}
                    data-testid={'delete-question-' + question.order}
                >
                    <Icon data={delete_to_trash}></Icon>
                </Button>
            </Tooltip>
        </Box>
    )
}

export default QuestionTemplateButtons
