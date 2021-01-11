import React, { useState } from 'react'

import { Box, Container } from '@material-ui/core'
import { Button, Typography, Icon } from '@equinor/eds-core-react'
import { add } from '@equinor/eds-icons'

import { Action, Participant, Question } from '../../api/models'
import ActionSidebar from './ActionSidebar'
import PriorityIndicator from './PriorityIndicator'
import { DataToCreateAction } from '../../api/mutations'

interface Props {
    question: Question
    participants: Participant[]
    onActionCreate: (action: DataToCreateAction) => void
}

const QuestionActionsList = ({ question, participants, onActionCreate }: Props) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
    const [actionToEdit, setActionToEdit] = useState<Action>()
    const actions = question.actions

    const editAction = (action: Action) => {
        setIsSidebarOpen(true)
        setActionToEdit(action)
    }

    const onClose = () => {
        setIsSidebarOpen(false)
        if (actionToEdit) {
            setActionToEdit(undefined)
        }
    }

    return (
        <>
            <Container>
                <Box pl={15}>
                    <Box display="flex" alignItems="center">
                        <Box flexGrow={1} display="flex" flexDirection="column-reverse">
                            <Typography variant="body_short" bold>
                                Actions
                            </Typography>
                        </Box>
                        <Box>
                            <Button variant="ghost" onClick={() => setIsSidebarOpen(true)}>
                                <Icon data={add}></Icon>
                                Add action
                            </Button>
                        </Box>
                    </Box>
                    {actions.map(action => {
                        return (
                            <div key={action.id}>
                                <Box display="flex">
                                    <Box p="0.3em">
                                        <PriorityIndicator priority={action.priority} />
                                    </Box>
                                    <Box display="flex" alignItems="center">
                                        <Typography link onClick={() => editAction(action)}>
                                            {action.title}
                                        </Typography>
                                    </Box>
                                </Box>
                            </div>
                        )
                    })}
                    {actions.length === 0 && <Typography italic>No actions added</Typography>}
                </Box>
            </Container>
            <ActionSidebar
                action={actionToEdit}
                open={isSidebarOpen}
                onClose={onClose}
                connectedQuestion={question}
                possibleAssignees={participants}
                onActionCreate={action => {
                    setIsSidebarOpen(false)
                    onActionCreate(action)
                }}
            />
        </>
    )
}

export default QuestionActionsList
