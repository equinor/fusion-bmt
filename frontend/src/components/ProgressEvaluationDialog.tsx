import { Button, Dialog, Scrim, Typography } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'
import React from 'react'
import { Progression } from '../api/models'
import { progressionToString } from '../utils/EnumToString'

interface ProgressEvaluationDialogProps {
    isOpen: boolean
    currentProgression: Progression
    onConfirmClick: () => void
    onCancelClick: () => void
}

const ProgressEvaluationDialog = ({isOpen, currentProgression, onConfirmClick, onCancelClick}: ProgressEvaluationDialogProps) => {
    if(!isOpen) return <></>

    return <>
        <Scrim
            isDismissable={true}
            onClose={onCancelClick}
        >
            <Dialog>
                <Dialog.Title>
                    Progress to the next step?
                </Dialog.Title>
                <Dialog.CustomContent>
                    <Typography>
                        {progressionDialogTexts(currentProgression)}
                    </Typography>
                </Dialog.CustomContent>
                <Dialog.Actions style={{
                    boxSizing: 'border-box',
                    width: '100%'
                }}>
                    <Box display="flex" flexDirection="row">
                        <Box flexGrow={1}>
                            <Button
                                onClick={onCancelClick}
                            >
                                No
                            </Button>
                        </Box>
                        <Box>
                            <Button
                                variant="ghost"
                                onClick={onConfirmClick}
                            >
                                Yes
                            </Button>
                        </Box>
                    </Box>
                </Dialog.Actions>
            </Dialog>
        </Scrim>
    </>
}

const progressionDialogTexts = (progression: Progression): string => {
    switch(progression){
    case Progression.Nomination: return `
        Progressing to ${progressionToString(Progression.Preparation)} will disable the ability to delete participants.
    `
    case Progression.Preparation:
    case Progression.Alignment:
    case Progression.Workshop: return `
        Progressing from ${progressionToString(progression)}
        will disable for everyone the ability to answer questions
        in the ${progressionToString(progression)} step.
    `
    case Progression.FollowUp: return `Progressing from ${progressionToString(progression)} will finish this evaluation. `
    }
}

export default ProgressEvaluationDialog
