import React, { useState } from 'react'

import { Box } from '@material-ui/core'
import { Button, Typography, Icon, Tooltip } from '@equinor/eds-core-react'
import { add } from '@equinor/eds-icons'
import { IconButton, DeleteIcon, DoneIcon, TextArea } from '@equinor/fusion-components'

import { Action, Participant, Question } from '../../api/models'
import PriorityIndicator from './PriorityIndicator'
import ActionEditSidebarWithApi from './EditForm/ActionEditSidebarWithApi'
import ActionCreateSidebarWithApi from './CreateForm/ActionCreateSidebarWithApi'

interface Props {
    question: Question
    participants: Participant[]
}

const QuestionActionsList = ({ question, participants }: Props) => {
    const [isEditSidebarOpen, setIsEditSidebarOpen] = useState<boolean>(false)
    const [isCreateSidebarOpen, setIsCreateSidebarOpen] = useState<boolean>(false)
    const [actionToEditId, setActionToEditId] = useState<string | undefined>()
    const actions = [...question.actions]

    const openActionEditSidebar = (action: Action) => {
        setIsEditSidebarOpen(true)
        setActionToEditId(action.id)
    }

    const onClose = () => {
        setIsEditSidebarOpen(false)
        setIsCreateSidebarOpen(false)
        setActionToEditId(undefined)
    }

    return (
        <>
            <Box paddingLeft="9rem">
                <Box display="flex" alignItems="center">
                    <Box flexGrow={1}>
                        <Typography variant="body_short" bold>
                            Actions
                        </Typography>
                    </Box>
                    <Box>
                        <Button variant="ghost" onClick={() => setIsCreateSidebarOpen(true)}>
                            <Icon data={add}></Icon>
                            Add action
                        </Button>
                    </Box>
                </Box>
                {actions
                    .sort((a1, a2) => {
                        if (a1.createDate < a2.createDate) {
                            return -1
                        }
                        if (a1.createDate > a2.createDate) {
                            return 1
                        }
                        return 0
                    })
                    .map(action => {
                        return (
                            <div key={action.id}>
                                <Box display="flex" alignItems="center">
                                    <Box p="0.3rem">
                                        <PriorityIndicator priority={action.priority} />
                                    </Box>
                                    <Box display="flex" alignItems="center">
                                        <Typography link onClick={() => openActionEditSidebar(action)}>
                                            {action.title}
                                        </Typography>
                                        {action.completed && (
                                            <Box p="0.1rem">
                                                <Tooltip placement="bottom" title="Completed">
                                                    <DoneIcon />
                                                </Tooltip>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </div>
                        )
                    })}
                {actions.length === 0 && <Typography italic>No actions added</Typography>}
            </Box>
            {actionToEditId !== undefined && (
                <ActionEditSidebarWithApi
                    action={actions.find(a => a.id === actionToEditId)!}
                    isOpen={isEditSidebarOpen}
                    onClose={onClose}
                    connectedQuestion={question}
                    possibleAssignees={participants}
                />
            )}
            <ActionCreateSidebarWithApi
                isOpen={isCreateSidebarOpen}
                onClose={onClose}
                connectedQuestion={question}
                possibleAssignees={participants}
            />
        </>
    )
}

export default QuestionActionsList
