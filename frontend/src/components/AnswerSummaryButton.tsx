import React from 'react'
import { IconButton } from '@equinor/fusion-react-button'

interface Props {
    onClick: () => void
}

const AnswerSummaryButton = ({ onClick }: Props) => {
    return (
        <>
            <IconButton onClick={onClick} data-testid="view-answers">
                <p>Copy Icon</p>
                {/* <CopyIcon /> */}
            </IconButton>
        </>
    )
}

export default AnswerSummaryButton
