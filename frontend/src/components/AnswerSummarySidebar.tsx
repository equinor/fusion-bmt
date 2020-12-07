import React from 'react'
import { ModalSideSheet } from '@equinor/fusion-components'
import { Question, Progression } from '../api/models'
import { Typography, Divider } from '@equinor/eds-core-react'
import { barrierToString } from '../utils/EnumToString'
import SingleAnswerSummary from './SingleAnswerSummary'

interface AnswerSummarySidebarProps
{
    open: boolean
    onCloseClick: () => void
    question: Question
    questionNumber: number
    previousProgression: Progression
}

const AnswerSummarySidebar = ({ open, onCloseClick, question, questionNumber, previousProgression }: AnswerSummarySidebarProps) => {
    return (
        <ModalSideSheet
            header={ barrierToString(question.barrier) }
            show={open}
            size='medium'
            onClose={onCloseClick}
            isResizable={false}
        >
            <div style={{margin: 20}}>
                <Typography variant="h3">{questionNumber}. {question.text}</Typography>
                <Divider />
                {
                    question.answers.filter(answer => answer.progression === previousProgression).map((answer) => {
                        return <SingleAnswerSummary answer={answer} key={answer.id} />
                    })
                }
                { question.answers.length === 0 &&
                    <p>No submitted answers</p>
                }
            </div>
        </ModalSideSheet>
    )
}

export default AnswerSummarySidebar
