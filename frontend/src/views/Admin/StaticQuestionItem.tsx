import React, { useRef, useState } from 'react'
import { tokens } from '@equinor/eds-tokens'
import { MarkdownViewer } from '@equinor/fusion-components'
import { Button, Chip, Icon, Tooltip, Typography } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'
import { more_vertical, edit, work, platform } from '@equinor/eds-icons'

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
                        <Box display="flex" flexDirection="row" mb={3} mt={1}>
                            <Box mr={1}>
                                <Chip style={{ backgroundColor: tokens.colors.infographic.primary__spruce_wood.rgba }}>
                                    <Tooltip title={'Responsible discipline'} placement={'bottom'}>
                                        <Icon data={work} size={16}></Icon>
                                    </Tooltip>
                                    {organizationToString(question.organization)}
                                </Chip>
                            </Box>
                            {question.projectCategories.map(category => (
                                <Box mr={1}>
                                    <Chip style={{ backgroundColor: tokens.colors.infographic.primary__mist_blue.rgba }}>
                                        <Tooltip title={'Project category'} placement={'bottom'}>
                                            <Icon data={platform} size={16}></Icon>
                                        </Tooltip>
                                        {category.name}
                                    </Chip>
                                </Box>
                            ))}
                        </Box>
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
