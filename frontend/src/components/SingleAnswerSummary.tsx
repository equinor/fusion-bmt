import React, { useEffect, useState } from 'react'
import { Grid, Box } from '@material-ui/core'
import SeverityIndicator from './SeverityIndicator'
import { Typography } from '@equinor/eds-core-react'
import { organizationToString } from '../utils/EnumToString'
import { MarkdownViewer } from '@equinor/fusion-components'
import { Answer } from '../api/models'
import { useApiClients } from '@equinor/fusion'

interface SingleAnswerSummaryProps
{
    answer: Answer
}

const SingleAnswerSummary = ({ answer }: SingleAnswerSummaryProps) => {
    const apiClients = useApiClients()
    const [username, setUsername] = useState<string>("")

    useEffect(() => {
        apiClients.people.getPersonDetailsAsync(answer.answeredBy!.azureUniqueId)
            .then((details) => {
                setUsername(details.data.name)
            })
    }, [])

    return (
        <>
            <Grid item xs={12}>
                <Box display="flex">
                    <Box mr={5}>
                        <SeverityIndicator severity={answer.severity} />
                    </Box>
                    <Box width="85%">
                        <Typography variant="h4">
                            {username}, {organizationToString(answer.answeredBy?.organization!)}
                        </Typography>
                        <MarkdownViewer markdown={answer.text} />
                    </Box>
                </Box>
            </Grid>
        </>
    )
}

export default SingleAnswerSummary
