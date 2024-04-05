import React from 'react'
import { Box } from '@mui/material'
import { Button, Dialog, Scrim, Typography } from '@equinor/eds-core-react'
import ButtonWithSaveIndicator from './ButtonWithSaveIndicator'

interface ConfirmationDialogProps {
    isOpen: boolean
    isLoading?: boolean
    title: string
    description?: string
    onConfirmClick: () => void
    onCancelClick: () => void
}

const ConfirmationDialog = ({ isOpen, isLoading = false, title, description, onConfirmClick, onCancelClick }: ConfirmationDialogProps) => {
    if (!isOpen) {
        return <></>
    }

    return (
        <>
            <Scrim isDismissable={true} onClose={onCancelClick} open={isOpen}>
                <Dialog
                    data-testid="confirmation_dialog"
                    open={isOpen}
                >
                    <Dialog.Title>{title}</Dialog.Title>
                    {description && (
                        <Dialog.CustomContent>
                            <Typography>{description}</Typography>
                        </Dialog.CustomContent>
                    )}
                    <Dialog.Actions
                        style={{
                            boxSizing: 'border-box',
                            width: '100%',
                        }}
                    >
                        <Box display="flex" flexDirection="row">
                            <Box flexGrow={1}>
                                <Button data-testid="no_button" onClick={onCancelClick} disabled={isLoading}>
                                    No
                                </Button>
                            </Box>
                            <Box>
                                <ButtonWithSaveIndicator
                                    variant="ghost"
                                    isLoading={isLoading}
                                    onClick={onConfirmClick}
                                    disabled={isLoading}
                                    testId="yes_button"
                                >
                                    Yes
                                </ButtonWithSaveIndicator>
                            </Box>
                        </Box>
                    </Dialog.Actions>
                </Dialog>
            </Scrim>
        </>
    )
}

export default ConfirmationDialog
