import { Button, Dialog, Scrim, Typography } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'

interface ConfirmationDialogProps {
    isOpen: boolean
    title: string
    description?: string
    onConfirmClick: () => void
    onCancelClick: () => void
}

const ConfirmationDialog = ({ isOpen, title, description, onConfirmClick, onCancelClick }: ConfirmationDialogProps) => {
    if (!isOpen) {
        return <></>
    }

    return (
        <>
            <Scrim isDismissable={true} onClose={onCancelClick}>
                <Dialog data-testid="confirmation_dialog">
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
                                <Button data-testid="no_button" onClick={onCancelClick}>
                                    No
                                </Button>
                            </Box>
                            <Box>
                                <Button data-testid="yes_button" variant="ghost" onClick={onConfirmClick}>
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
