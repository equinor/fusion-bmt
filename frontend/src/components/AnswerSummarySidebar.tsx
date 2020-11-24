import React from 'react'
import { ModalSideSheet } from '@equinor/fusion-components'
import { Question, Barrier } from '../api/models'
import { Typography } from '@equinor/eds-core-react'
import { barrierToString } from '../utils/EnumToString'

interface AnswerSummarySidebarProps
{
    open: boolean
    onCloseClick: () => void
    question: Question
}

const AnswerSummarySidebar = ({ open, onCloseClick, question }: AnswerSummarySidebarProps) => {
    return (
        <ModalSideSheet
            header={ barrierToString(question.barrier) }
            show={open}
            size='medium'
            onClose={onCloseClick}
            isResizable={false}
        >
            <Typography variant="h3">{question.text}</Typography>
        </ModalSideSheet>
    )
}

export default AnswerSummarySidebar
