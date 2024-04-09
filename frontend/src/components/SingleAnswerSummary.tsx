import { useEffect, useState } from 'react'

import { Grid, Box } from '@mui/material'
import { Typography } from '@equinor/eds-core-react'
import { MarkdownViewer } from '@equinor/fusion-react-markdown';

import { Answer, Role } from '../api/models'
import { organizationToString } from '../utils/EnumToString'
import SeverityIndicator from './SeverityIndicator'
import { useSharedFacilitatorAnswer } from '../utils/helpers'
import { usePeopleApi } from '../api/usePeopleApi';

interface SingleAnswerSummaryProps {
    answer: Answer
}

const SingleAnswerSummary = ({ answer }: SingleAnswerSummaryProps) => {
    const apiClients = usePeopleApi()
    const [username, setUsername] = useState<string>('')
    const useShared = answer.answeredBy!.role === Role.Facilitator && useSharedFacilitatorAnswer(answer.progression)
    const organization = organizationToString(answer.answeredBy?.organization!)

    useEffect(() => {
        if (useShared) {
            setUsername('Facilitators')
        } else {
            apiClients.getById(answer.answeredBy!.azureUniqueId).then(details => {
                setUsername(details.data.name)
            })
        }
    }, [])

    return (
        <>
            <Grid item xs={12}>
                <Box display="flex">
                    <Box mr={1}>
                        <SeverityIndicator severity={answer.severity} />
                    </Box>
                    <Box width={1}>
                        <Typography variant="h5">
                            {username}
                            {useShared ? '' : ', '.concat(organization)}
                        </Typography>
                        <MarkdownViewer value={answer.text} />
                    </Box>
                </Box>
            </Grid>
        </>
    )
}

export default SingleAnswerSummary
