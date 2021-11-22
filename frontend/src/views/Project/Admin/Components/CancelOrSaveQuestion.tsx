import { Box } from '@material-ui/core'
import { Button } from '@equinor/eds-core-react'

import { SavingState } from '../../../../utils/Variables'
import SaveIndicator from '../../../../components/SaveIndicator'

interface Props {
    isQuestionTemplateSaving: boolean
    onClickSave: () => void
    onClickCancel: () => void
    questionTitle: string
}

const CancelOrSaveQuestion = ({ isQuestionTemplateSaving, onClickSave, onClickCancel, questionTitle }: Props) => {
    return (
        <>
            {isQuestionTemplateSaving && (
                <Box alignSelf={'flex-end'} mb={1}>
                    <SaveIndicator savingState={SavingState.Saving} />
                </Box>
            )}
            <Box alignSelf={'flex-end'} style={{ minWidth: '170px' }}>
                <Button
                    data-testid="cancel-edit-question"
                    variant="outlined"
                    style={{ marginRight: '20px' }}
                    onClick={() => onClickCancel()}
                    disabled={isQuestionTemplateSaving}
                >
                    Cancel
                </Button>
                <Button
                    data-testid="save-question-button"
                    onClick={() => onClickSave()}
                    disabled={isQuestionTemplateSaving || questionTitle.length === 0}
                >
                    Save
                </Button>
            </Box>
        </>
    )
}

export default CancelOrSaveQuestion
