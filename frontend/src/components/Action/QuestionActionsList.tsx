import React, { useState } from 'react'

import { Box } from '@material-ui/core'
import { Button, Typography, Icon, Tooltip } from '@equinor/eds-core-react'
import { add } from '@equinor/eds-icons'
import { IconButton, DeleteIcon, DoneIcon, TextArea } from '@equinor/fusion-components'

import { Action, Participant, Question } from '../../api/models'
import { useDeleteActionMutation } from '../../api/mutations'
import PriorityIndicator from './PriorityIndicator'
import ActionEditSidebarWithApi from './EditForm/ActionEditSidebarWithApi'
import ActionCreateSidebarWithApi from './CreateForm/ActionCreateSidebarWithApi'
import ConfirmationDialog from './../ConfirmationDialog'

interface Props {
    question: Question
    participants: Participant[]
}

const QuestionActionsList = ({ question, participants }: Props) => {
    const [isEditSidebarOpen, setIsEditSidebarOpen] = useState<boolean>(false)
    const [isCreateSidebarOpen, setIsCreateSidebarOpen] = useState<boolean>(false)
    const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState<boolean>(false)
    const [actionIdToEdit, setActionIdToEdit] = useState<string | undefined>()
    const [actionToDelete, setActionToDelete] = useState<string | undefined>()
    const actions = [...question.actions]

    const { deleteAction, error: errorDeletingAction } = useDeleteActionMutation(question.id)

    const openActionEditSidebar = (action: Action) => {
        setIsEditSidebarOpen(true)
        setActionIdToEdit(action.id)
    }

    const onClose = () => {
        setIsEditSidebarOpen(false)
        setIsCreateSidebarOpen(false)
        setActionIdToEdit(undefined)
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
                        if (errorDeletingAction !== undefined && actionToDelete === action.id) {
                            return (
                                <div>
                                    <TextArea value={`Error deleting action: ${JSON.stringify(errorDeletingAction)}`} onChange={() => {}} />
                                </div>
                            )
                        }
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
                                                <Tooltip placement="bottom" title="Completed" data-testid={`action_complete_${action.id}`}>
                                                    <DoneIcon />
                                                </Tooltip>
                                            </Box>
                                        )}
                                    </Box>
                                    <IconButton
                                        data-testid={`delete_action_button_${action.id}`}
                                        onClick={() => {
                                            setIsConfirmDeleteDialogOpen(true)
                                            setActionToDelete(action.id)
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </div>
                        )
                    })}
                {actions.length === 0 && <Typography italic>No actions added</Typography>}
            </Box>
            {actionIdToEdit !== undefined && (
                <ActionEditSidebarWithApi
                    action={actions.find(a => a.id === actionIdToEdit)!}
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
            <ConfirmationDialog
                isOpen={isConfirmDeleteDialogOpen}
                title="Delete Action?"
                description="Deleting an action will permanently delete it from evaluation."
                onConfirmClick={() => {
                    deleteAction(actionToDelete!)
                    setIsConfirmDeleteDialogOpen(false)
                }}
                onCancelClick={() => {
                    setIsConfirmDeleteDialogOpen(false)
                    setActionToDelete(undefined)
                }}
            />
        </>
    )
}

export default QuestionActionsList
