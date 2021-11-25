import { Box } from '@material-ui/core'
import { Button } from '@equinor/eds-core-react'

import ButtonWithSaveIndicator from './ButtonWithSaveIndicator'

interface Props {
    onClickSave: () => void
    onClickCancel: () => void
    isSaving?: boolean
    cancelButtonTestId?: string
    saveButtonTestId?: string
    disableCancelButton?: boolean
    disableSaveButton?: boolean
}

const CancelAndSaveButton = ({
    onClickSave,
    onClickCancel,
    isSaving,
    cancelButtonTestId,
    saveButtonTestId,
    disableSaveButton,
    disableCancelButton,
}: Props) => {
    return (
        <>
            <Box display="flex" alignSelf="flex-end" justifyContent="center">
                <Button
                    data-testid={cancelButtonTestId}
                    variant="outlined"
                    style={{ marginRight: '10px' }}
                    onClick={onClickCancel}
                    disabled={disableCancelButton}
                >
                    Cancel
                </Button>
                <ButtonWithSaveIndicator isLoading={isSaving} onClick={onClickSave} disabled={disableSaveButton} testId={saveButtonTestId}>
                    Save
                </ButtonWithSaveIndicator>
            </Box>
        </>
    )
}

export default CancelAndSaveButton
