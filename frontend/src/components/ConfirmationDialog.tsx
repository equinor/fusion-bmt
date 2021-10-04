import React from 'react'
import { Box } from '@material-ui/core'
import { Button, CircularProgress, Dialog, Scrim, Typography } from '@equinor/eds-core-react'

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
            <Scrim isDismissable={true} onClose={onCancelClick}>
                <Dialog data-testid="confirmation_dialog">
                    <Dialog.Title>{title}</Dialog.Title>
                    {isLoading && (
                        <Box display={'flex'} alignItems={'center'} justifyContent={'center'} mt={2} mb={4}>
                            <CircularProgress style={{ width: '25px', height: '25px' }} />
                        </Box>
                    )}
                    {!isLoading && description && (
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
                                <Button data-testid="yes_button" variant="ghost" onClick={onConfirmClick} disabled={isLoading}>
                                    Yes
                                </Button>
                            </Box>
                        </Box>
                    </Dialog.Actions>
                </Dialog>
            </Scrim>
        </>
    )
}

export default ConfirmationDialog
