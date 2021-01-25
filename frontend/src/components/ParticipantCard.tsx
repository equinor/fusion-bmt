import { PersonDetails, useApiClients } from '@equinor/fusion'
import { PersonCard } from '@equinor/fusion-components'
import { Box } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { Participant } from '../api/models'

interface ParticipantCardProps {
    participant: Participant
}

const ParticipantCard = ({ participant }: ParticipantCardProps) => {
    const apiClients = useApiClients()

    const [isFetchingPerson, setIsFetchingPerson] = useState<boolean>(true)
    const [personDetails, setPersonDetails] = useState<PersonDetails>()

    useEffect(() => {
        let isMounted = true

        apiClients.people.getPersonDetailsAsync(participant.azureUniqueId).then(response => {
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
                <PersonCard isFetchingPerson={isFetchingPerson} person={personDetails} />
            </Box>
        </>
    )
}

export default ParticipantCard
