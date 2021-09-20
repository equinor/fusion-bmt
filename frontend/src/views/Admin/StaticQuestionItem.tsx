import React, { useRef, useState } from 'react'
import { Chip, MarkdownViewer } from '@equinor/fusion-components'
import { Button, Icon, Typography } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'
import { more_vertical, edit } from '@equinor/eds-icons'

import { QuestionTemplate } from '../../api/models'
import { organizationToString } from '../../utils/EnumToString'
import QuestionTemplateMenu from './QuestionTemplateMenu'

interface Props {
    question: QuestionTemplate
    setIsInEditmode: (inEditmode: boolean) => void
}

const StaticQuestionItem = ({ question, setIsInEditmode }: Props) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const anchorRef = useRef<HTMLButtonElement>(null)

    const openMenu = () => {
        setIsOpen(true)
    }
    const closeMenu = () => {
        setIsOpen(false)
    }

    return (
        <>
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
                <Box>
                    <Button variant="ghost" color="primary" onClick={() => setIsInEditmode(true)}>
                        <Icon data={edit}></Icon>
                    </Button>
                </Box>
                <Box>
                    <Button variant="ghost" color="primary" ref={anchorRef} onClick={() => (isOpen ? closeMenu() : openMenu())}>
                        <Icon data={more_vertical}></Icon>
                    </Button>
                    <QuestionTemplateMenu isOpen={isOpen} anchorRef={anchorRef} closeMenu={closeMenu} />
                </Box>
            </Box>
        </>
    )
}

export default StaticQuestionItem
