import React from 'react'
import { Chip } from '@equinor/eds-core-react'
import { Typography } from '@equinor/eds-core-react'
import { MarkdownViewer } from '@equinor/fusion-react-markdown';
import { Answer, Question, Severity } from '../../api/models'
import { Box, Grid } from '@mui/material'
import AnswerSeverityForm from './AnswerSeverityForm'
import AnswerMarkdownForm from './AnswerMarkdownForm'
import { organizationToString } from '../../utils/EnumToString'
import Disabler from '../Disabler'
import SaveIndicator from '../SaveIndicator'
import { SavingState } from '../../utils/Variables'

interface QuestionAndAnswerFormProps {
    question: Question
    answer: Answer
    disabled: boolean
    onAnswerTextChange: (text: string) => void
    onSeverityChange: (severity: Severity) => void
    savingState: SavingState
}

const QuestionAndAnswerForm = ({
    question,
    answer,
    disabled,
    onAnswerTextChange,
    onSeverityChange,
    savingState,
}: QuestionAndAnswerFormProps) => {
    return (
        <>
            <Grid container>
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" alignItems="center">
                        <Box mr={2}>
                            <SaveIndicator savingState={savingState} />
                        </Box>
                        <Chip> {organizationToString(question.organization)} </Chip>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box display="flex" mb={3}>
                        <Box ml={2} mr={1}>
                            <Typography variant="h3" data-testid={'questionNo-' + question.order}>
                                {question.order}.
                            </Typography>
                        </Box>
                        <Box>
                            <Box data-testid={'question-' + question.order}>
                                {question.text.split('\n').map((t, index) => {
                                    return (
                                        <span key={index}>
                                            <Typography variant="h3">{t}</Typography>
                                            <br />
                                        </span>
                                    )
                                })}
                            </Box>
                            <MarkdownViewer value={question.supportNotes} />
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Disabler disable={disabled}>
                        <Box display="flex">
                            <Box mr={5}>
                                <AnswerSeverityForm
                                    severity={answer.severity}
                                    onSeveritySelected={severity => onSeverityChange(severity)}
                                    disabled={disabled}
                                />
                            </Box>
                            <Box width="85%">
                                <AnswerMarkdownForm
                                    markdown={answer.text === '' ? ' ' : answer.text /*Fixes backspace error in markdown editor*/}
                                    disabled={disabled}
                                    onMarkdownChange={text => {
                                        onAnswerTextChange(text)
                                    }}
                                />
                            </Box>
                        </Box>
                    </Disabler>
                </Grid>
            </Grid>
        </>
    )
}

export default QuestionAndAnswerForm
