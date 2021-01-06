import React, { useState } from 'react'

import { Box, Container } from '@material-ui/core'
import { Button, Typography, Icon } from '@equinor/eds-core-react'
import {
    add
} from '@equinor/eds-icons'

import { Participant, Question } from '../../api/models'
import ActionCreateSidebar from './ActionCreateSidebar'
import PriorityIndicator from './PriorityIndicator'
import { DataToCreateAction } from '../../api/mutations'

interface Props {
    question: Question
    participants: Participant[]
    onActionCreate: (action: DataToCreateAction) => void
}

const QuestionActionsList = ({ question, participants, onActionCreate }: Props) => {
    const [isActionCreateSidebarOpen, setIsActionCreateSidebarOpen] = useState<boolean>(false)
    const actions = question.actions

    return <>
        <Container>
            <Box pl={15}>
                <Box display="flex" alignItems="center">
                    <Box flexGrow={1} display="flex" flexDirection="column-reverse">
                        <Typography variant="body_short" bold>Actions</Typography>
                    </Box>
                    <Box >
                        <Button
                            variant="ghost"
                            onClick={() => setIsActionCreateSidebarOpen(true)}
                        >
                            <Icon data={add}></Icon>
                            Add action
                        </Button>
                    </Box>
                </Box>
                {actions.map(action => {
                    return <div key={action.id}>
                        <Box display="flex">
                            <Box p='0.3em'>
                                <PriorityIndicator priority={action.priority} />
                            </Box>
                            <Box display="flex" alignItems="center">
                                <Typography>
                                    {action.title}
                                </Typography>
                            </Box>
                        </Box>
                    </div>
                })}
                {actions.length === 0 &&
                    <Typography italic>
                        No actions added
                    </Typography>
                }
            </Box>
        </Container>
        <ActionCreateSidebar
            open={isActionCreateSidebarOpen}
            onCloseClick={() => setIsActionCreateSidebarOpen(false)}
            connectedQuestion={question}
            possibleAssignees={participants}
            onActionCreate={(action) => {
                setIsActionCreateSidebarOpen(false)
                onActionCreate(action)
            }}
        />
    </>
}

export default QuestionActionsList
