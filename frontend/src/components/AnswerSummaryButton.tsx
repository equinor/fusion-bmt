import React from 'react'
import { CopyIcon, IconButton } from '@equinor/fusion-components'

interface Props {
    onClick: () => void
}

const AnswerSummaryButton = ({ onClick }: Props) => {
    return (
        <>
            <IconButton onClick={onClick} data-testid="view-answers">
                <CopyIcon />
            </IconButton>
        </>
    )
}

export default AnswerSummaryButton
