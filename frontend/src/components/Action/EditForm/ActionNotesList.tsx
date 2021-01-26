import React from 'react'
import { Box } from '@material-ui/core'
import { Note } from '../../../api/models'
import { PersonDetails } from '@equinor/fusion'

interface Props {
    notes: Note[]
    participantsDetails: PersonDetails[]
}

const ActionNotesList = ({ notes, participantsDetails }: Props) => {
    const sortedNotes = notes.slice().sort((a, b) => {
        const aDate = new Date(a.createDate)
        const bDate = new Date(b.createDate)

        if (aDate < bDate) {
            return 1
        }

        if (aDate > bDate) {
            return -1
        }

        return 0
    })

    return (
        <Box mt={2}>
            {sortedNotes.map(note => {
                const createrDetails: PersonDetails | undefined = participantsDetails.find(
                    p => p.azureUniqueId === note.createdBy!.azureUniqueId
                )
                const date = new Date(note.createDate)
                const dateString = date.toLocaleDateString()
                const hours = date.getHours()
                const minutes = date.getMinutes()
                const hoursPadded = (hours < 10 ? '0' : '') + hours
                const minutesPadded = (minutes < 10 ? '0' : '') + minutes

                return (
                    <Box key={note.id} display="flex" flexDirection="column" fontSize="fontSize" mb={2}>
                        <Box display="flex" flexDirection="row" fontWeight="fontWeightMedium">
                            <Box flexGrow={1}>{createrDetails?.name || 'Unknown user'} wrote</Box>
                            <Box>
                                {hoursPadded}:{minutesPadded} - {dateString}
                            </Box>
                        </Box>
                        <Box mt={1}>{note.text}</Box>
                    </Box>
                )
            })}
        </Box>
    )
}

export default ActionNotesList
