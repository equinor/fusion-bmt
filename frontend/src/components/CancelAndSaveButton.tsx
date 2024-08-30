import { Grid } from '@mui/material'
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
    isCreate?: boolean
}

const CancelAndSaveButton = ({
    onClickSave,
    onClickCancel,
    isSaving,
    cancelButtonTestId,
    saveButtonTestId,
    disableSaveButton,
    disableCancelButton,
    isCreate,
}: Props) => {
    return (
        <Grid display="flex" justifyContent="flex-end">
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
                {isCreate ? "Create" : "Save"}
            </ButtonWithSaveIndicator>
        </Grid>
    )
}

export default CancelAndSaveButton
