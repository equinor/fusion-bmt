import React from 'react'
import { Box } from '@mui/material'
import { ClosingRemark, Note } from '../../../api/models'
import { PersonDetails } from '@equinor/fusion'
import { tokens } from '@equinor/eds-tokens'
import { MarkdownViewer } from '@equinor/fusion-react-markdown';

interface Props {
    notesAndClosingRemarks: (Note | ClosingRemark)[]
    participantsDetails: PersonDetails[]
}

const NotesAndClosingRemarksList = ({ notesAndClosingRemarks, participantsDetails }: Props) => {
    const sortedNotesAndRemarks = notesAndClosingRemarks.slice().sort((a, b) => {
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
        <Box mt={5} data-testid={'notes_list'}>
            {sortedNotesAndRemarks.map(noteOrRemark => {
                const createrDetails: PersonDetails | undefined = participantsDetails.find(
                    p => p.azureUniqueId === noteOrRemark.createdBy!.azureUniqueId
                )
                const date = new Date(noteOrRemark.createDate)
                const dateString = date.toLocaleDateString()
                const hours = date.getHours()
                const minutes = date.getMinutes()
                const hoursPadded = (hours < 10 ? '0' : '') + hours
                const minutesPadded = (minutes < 10 ? '0' : '') + minutes

                const isClosingRemark = noteOrRemark.__typename === 'ClosingRemark'

                return (
                    <Box
                        data-testid={isClosingRemark ? 'closing_note' : 'note'}
                        key={noteOrRemark.id}
                        display="flex"
                        flexDirection="column"
                        fontSize="fontSize"
                        mb={2}
                        style={{ backgroundColor: isClosingRemark ? tokens.colors.ui.background__light.rgba : 'white', padding: '5px' }}
                    >
                        <Box display="flex" flexDirection="row" fontWeight="fontWeightMedium">
                            <Box flexGrow={1}>
                                {createrDetails?.name || 'Unknown user'} {isClosingRemark ? 'closed action' : 'wrote'}
                            </Box>
                            <Box>
                                {hoursPadded}:{minutesPadded} - {dateString}
                            </Box>
                        </Box>
                        <Box data-testid={'note_text'}>
                            <MarkdownViewer value={noteOrRemark.text} />
                        </Box>
                    </Box>
                )
            })}
        </Box>
    )
}

export default NotesAndClosingRemarksList
