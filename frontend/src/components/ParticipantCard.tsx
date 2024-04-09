import { PersonAvatar, PersonDetails } from '@equinor/fusion-react-person'
import { Box, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Participant } from '../api/models'
import { usePeopleApi } from '../api/usePeopleApi'

interface ParticipantCardProps {
    participant: Participant
}

const ParticipantCard = ({ participant }: ParticipantCardProps) => {

    const apiClients = usePeopleApi()

    const [isFetchingPerson, setIsFetchingPerson] = useState<boolean>(true)
    const [personDetails, setPersonDetails] = useState<PersonDetails>()

    useEffect(() => {
        let isMounted = true

        apiClients.getById(participant.azureUniqueId).then(response => {
            const personDetails = response.data
            if (isMounted) {
                setPersonDetails(personDetails)
                setIsFetchingPerson(false)
            }
        })

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <>
            <Box p="4px">
                <PersonAvatar azureId={personDetails?.azureId} />
                <Typography variant="body1">{personDetails?.name}</Typography>
            </Box>
        </>
    )
}

export default ParticipantCard
