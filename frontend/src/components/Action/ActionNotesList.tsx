import React from 'react'
import { Box } from '@material-ui/core'

const notes = [
    {
        id: 'hfjkhfkf78f6s9fhj',
        writerName: 'Anna Therese Asheim',
        message: 'Kan du se på dette Andreas Rønning?',
        date: '2021-01-10T11:27:08.024+01:00',
    },
]

const ActionNotesList = () => {
    return (
        <Box mt={2}>
            {notes.map(note => {
                const dateAndTime = note && note.date && new Date(note.date).toLocaleString('en-GB').split(',')
                const date = dateAndTime[0]
                const hours = dateAndTime[1].split(':')[0]
                const minutes = dateAndTime[1].split(':')[1]

                return (
                    <Box key={note.id} display="flex" flexDirection="column" fontSize="fontSize">
                        <Box display="flex" flexDirection="row" fontWeight="fontWeightMedium">
                            <Box flexGrow={1}>{note.writerName} wrote</Box>
                            <Box>
                                {hours}:{minutes} - {date}
                            </Box>
                        </Box>
                        <Box mt={1}>{note.message}</Box>
                    </Box>
                )
            })}
        </Box>
    )
}

export default ActionNotesList
