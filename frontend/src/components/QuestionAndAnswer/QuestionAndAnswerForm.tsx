import { Chip } from '@equinor/fusion-components'
import React, { useEffect, useState } from 'react'
import { Typography } from '@equinor/eds-core-react'

import { Answer, Question } from '../../api/models'
import { Box, Grid } from '@material-ui/core'
import AnswerSeverityForm from './AnswerSeverityForm'
import AnswerMarkdownForm from './AnswerMarkdownForm'

const WRITE_DELAY_MS = 1000

interface QuestionAndAnswerFormProps {
    questionNumber: number
    question: Question
    answer: Answer
    onAnswerChange: (answer: Answer) => void
}

const QuestionAndAnswerForm = ({questionNumber, question, answer, onAnswerChange}: QuestionAndAnswerFormProps) => {
    const [markdown, setMarkdown] = useState<string>(answer.text)

    useEffect(() => {
        const timeout = setTimeout(() => {
            onAnswerChange({...answer, text: markdown})
        }, WRITE_DELAY_MS)
        return () => {
            clearTimeout(timeout)
        }
    }, [markdown])

    return <>
        <Grid container>
            <Grid item xs={12}>
                <Box display="flex" flexDirection="row-reverse">
                    <Box>
                        <Chip primary title={question.organization.toLowerCase()}/>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box display="flex" mb={3}>
                    <Box ml={2} mr={1}>
                        <Typography variant="h3">{questionNumber}.</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h3">{question.text}</Typography>
                        <Typography>{question.supportNotes}</Typography>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box display="flex">
                    <Box mr={5}>
                        <AnswerSeverityForm
                            severity={answer.severity}
                            onSeveritySelected={(severity) => onAnswerChange({...answer, severity: severity})}
                        />
                    </Box>
                    <Box width="85%">
                        <AnswerMarkdownForm
                            markdown={markdown}
                            onMarkdownChange={setMarkdown}
                        />
                    </Box>
                </Box>
            </Grid>
        </Grid>
    </>
}

export default QuestionAndAnswerForm
