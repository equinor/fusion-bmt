import React from 'react'
import { Chip } from '@equinor/fusion-components'
import { Typography } from '@equinor/eds-core-react'

import { Answer, Question, Severity } from '../../api/models'
import { Box, Grid } from '@material-ui/core'
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
                        <Chip primary title={organizationToString(question.organization)} />
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
                            <Typography variant="h3" data-testid={'question-' + question.order}>
                                {question.text}
                            </Typography>
                            {question.supportNotes.split('\n').map(supportNotePart => {
                                return <Typography key={question.id + supportNotePart}>{supportNotePart}</Typography>
                            })}
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
