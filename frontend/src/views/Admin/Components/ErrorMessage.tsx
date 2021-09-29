import { tokens } from '@equinor/eds-tokens'
import { apiErrorMessage } from '../../../api/error'
import { Typography } from '@equinor/eds-core-react'

interface Props {
    text: string
}

const ErrorMessage = ({ text }: Props) => {
    return (
        <div
            style={{
                backgroundColor: tokens.colors.ui.background__light.rgba,
                padding: '10px',
            }}
        >
            <Typography>{apiErrorMessage(text)}</Typography>
        </div>
    )
}

export default ErrorMessage
