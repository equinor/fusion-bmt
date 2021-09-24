import { Box } from "@material-ui/core"
import { TextArea } from '@equinor/fusion-components'
import { ApolloError } from "@apollo/client"
import { apiErrorMessage } from "../../../api/error"

interface Props {
    questionTemplateSaveError: ApolloError | undefined
}

const ErrorSavingQuestion = ({questionTemplateSaveError}: Props) => {
    return (
        <>
            {questionTemplateSaveError && (
                <Box mt={2} ml={4}>
                    <Box>
                        <TextArea value={apiErrorMessage('Not able to save')} onChange={() => {}} />
                    </Box>
                </Box>
            )}
        </>
    )
}

export default ErrorSavingQuestion
