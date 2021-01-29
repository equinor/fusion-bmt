import React, { useState } from 'react'

import { Grid } from '@material-ui/core'
import { Button, Icon, TextField } from '@equinor/eds-core-react'
import { add } from '@equinor/eds-icons'

import { TextFieldChangeEvent } from '../utils'

interface Props {
    onCreateClick: (text: string) => void
}

const NoteCreateForm = ({ onCreateClick }: Props) => {
    const [noteInProgress, setNoteInProgress] = useState<string>('')

    const addNote = () => {
        if (noteInProgress.length > 0) {
            onCreateClick(noteInProgress)
            setNoteInProgress('')
        }
    }

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={10}>
                    <TextField
                        id="noteInProgress"
                        value={noteInProgress}
                        multiline
                        label="Notes"
                        onChange={(event: TextFieldChangeEvent) => setNoteInProgress(event.target.value)}
                        onKeyPress={(e: any) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addNote()
                            }
                        }}
                        variant="default"
                        style={{ height: 75 }}
                    />
                </Grid>
                <Grid item xs={2} container={true} alignItems="center">
                    <Button variant="ghost" onClick={addNote}>
                        <Icon data={add}></Icon>
                    </Button>
                </Grid>
            </Grid>
        </>
    )
}

export default NoteCreateForm
