import { Box } from '@material-ui/core'
import { Button } from '@equinor/eds-core-react'
import SaveIndicator from '../../../components/SaveIndicator'
import { SavingState } from '../../../utils/Variables'

interface Props {
    isQuestionTemplateSaving: boolean
    setIsInMode: (isInMode: boolean) => void
    onClickSave: () => void
    textValidity: string
}

const CancelOrSaveQuestion = ({ isQuestionTemplateSaving, setIsInMode, onClickSave, textValidity }: Props) => {
    return (
        <>
            {isQuestionTemplateSaving && (
                <Box alignSelf={'flex-end'} mb={1}>
                    <SaveIndicator savingState={SavingState.Saving} />
                </Box>
            )}
            <Box alignSelf={'flex-end'}>
                <Button
                    variant="outlined"
                    style={{ marginRight: '20px' }}
                    onClick={() => setIsInMode(false)}
                    disabled={isQuestionTemplateSaving}
                >
                    Cancel
                </Button>
                <Button onClick={() => onClickSave()} disabled={isQuestionTemplateSaving || textValidity === 'error'}>
                    Save
                </Button>
            </Box>
        </>
    )
}

export default CancelOrSaveQuestion
