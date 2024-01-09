import React from 'react'
import { Button } from '@equinor/eds-core-react'
import { Icon } from '@equinor/eds-core-react'
import { copy } from '@equinor/eds-icons'


interface Props {
    onClick: () => void
}

const AnswerSummaryButton = ({ onClick }: Props) => {
    return (
            <Button variant="ghost_icon" onClick={onClick} data-testid="view-answers">
                <Icon data={copy} />
            </Button>
    )
}

export default AnswerSummaryButton
