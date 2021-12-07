import { useEffect, useState } from 'react'

import { Grid, Box } from '@material-ui/core'
import { Typography } from '@equinor/eds-core-react'
import { useApiClients } from '@equinor/fusion'
import { MarkdownViewer } from '@equinor/fusion-components'

import { Answer, Role } from '../api/models'
import { organizationToString } from '../utils/EnumToString'
import SeverityIndicator from './SeverityIndicator'
import { useSharedFacilitatorAnswer } from '../utils/helpers'

interface SingleAnswerSummaryProps {
    answer: Answer
}

const SingleAnswerSummary = ({ answer }: SingleAnswerSummaryProps) => {
    const apiClients = useApiClients()
    const [username, setUsername] = useState<string>('')
    const useShared = answer.answeredBy!.role === Role.Facilitator && useSharedFacilitatorAnswer(answer.progression)
    const organization = organizationToString(answer.answeredBy?.organization!)

    useEffect(() => {
        if (useShared) {
            setUsername('Facilitators')
        } else {
            apiClients.people.getPersonDetailsAsync(answer.answeredBy!.azureUniqueId).then(details => {
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
                        <MarkdownViewer markdown={answer.text} />
                    </Box>
                </Box>
            </Grid>
        </>
    )
}

export default SingleAnswerSummary
