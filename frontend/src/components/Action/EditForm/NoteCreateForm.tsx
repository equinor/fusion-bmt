import React from 'react'

import { Grid } from '@material-ui/core'
import { Icon, TextField } from '@equinor/eds-core-react'
import { add } from '@equinor/eds-icons'

import { TextFieldChangeEvent } from '../utils'
import ButtonWithSaveIndicator from '../../ButtonWithSaveIndicator'
import { ApolloError } from '@apollo/client'
import ErrorBanner from '../../ErrorBanner'
import { genericErrorMessage } from '../../../utils/Variables'
import { useShowErrorHook } from '../../../utils/hooks'

interface Props {
    text: string
    onChange: (text: string) => void
    onCreateClick: (text: string) => void
    disabled: boolean
    isCreatingNote: boolean
    apiErrorNote: ApolloError | undefined
}

const NoteCreateForm = ({ text, onChange, onCreateClick, disabled, isCreatingNote, apiErrorNote }: Props) => {
    const { showErrorMessage, setShowErrorMessage } = useShowErrorHook(apiErrorNote)

    const addNote = () => {
        if (text.length > 0) {
            onCreateClick(text)
        }
    }

    return (
        <>
            {showErrorMessage && (
                <ErrorBanner
                    message={'Could not create note at this time. ' + genericErrorMessage}
                    onClose={() => setShowErrorMessage(false)}
                />
            )}
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
                        style={{ height: 75 }}
                    />
                </Grid>
                <Grid item xs={2} container={true} alignItems="center">
                    <ButtonWithSaveIndicator
                        variant="ghost"
                        onClick={addNote}
                        disabled={disabled}
                        style={{ marginTop: '20px' }}
                        testId="add_note_button"
                        isLoading={isCreatingNote}
                    >
                        <Icon data={add}></Icon>
                    </ButtonWithSaveIndicator>
                </Grid>
            </Grid>
        </>
    )
}

export default NoteCreateForm
