import React from 'react'
import { Question, Progression } from '../api/models'
import { Typography, Divider, SideSheet } from '@equinor/eds-core-react'
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
        <SideSheet
            title={ barrierToString(question.barrier) }
            open={open}
            variant='large'
            onClose={onCloseClick}
            style={{position: 'relative'}}
        >
            <Typography variant="h4">{questionNumber}. {question.text}</Typography>
            <Divider />
            {
                question.answers.filter(answer => answer.progression === previousProgression).map((answer) => {
                    return <SingleAnswerSummary answer={answer} key={answer.id} />
                })
            }
            { question.answers.length === 0 &&
                <p>No submitted answers</p>
            }
        </SideSheet>
    )
}

export default AnswerSummarySidebar
