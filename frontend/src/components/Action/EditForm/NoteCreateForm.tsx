import React, { useState } from 'react'

import { Grid } from '@material-ui/core'
import { Button, Icon, TextField } from '@equinor/eds-core-react'
import { add } from '@equinor/eds-icons'

import { TextFieldChangeEvent } from '../utils'

interface Props {
    text: string
    onChange: (text: string) => void
    onCreateClick: (text: string) => void
    disabled: boolean
}

const NoteCreateForm = ({ text, onChange, onCreateClick, disabled }: Props) => {
    const addNote = () => {
        if (text.length > 0) {
            onCreateClick(text)
        }
    }

    return (
        <>
            <Grid container spacing={3} style={{ marginTop: '20px' }}>
                <Grid item xs={10}>
                    <TextField
                        id="noteInProgress"
                        value={text}
                        multiline
                        label="Notes"
                        onChange={(event: TextFieldChangeEvent) => onChange(event.target.value)}
                        disabled={disabled}
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
                    <Button
                        variant="ghost"
                        onClick={addNote}
                        disabled={disabled}
                        style={{ marginTop: '20px' }}
                        data-testid="add_note_button"
                    >
                        <Icon data={add}></Icon>
                    </Button>
                </Grid>
            </Grid>
        </>
    )
}

export default NoteCreateForm
