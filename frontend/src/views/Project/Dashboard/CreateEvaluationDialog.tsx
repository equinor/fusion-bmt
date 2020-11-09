import React, { useState } from 'react'

import { Button, ModalSideSheet, TextInput } from '@equinor/fusion-components'
import { Typography } from '@equinor/eds-core-react'
import { Container, Grid } from '@material-ui/core'

const NAME_MIN_LENGTH = 3

interface CreateEvaluationDialogProps {
    open: boolean
    onCreate: (name: string) => void
    onCancelClick: () => void
}

const CreateEvaluationDialog = ({open, onCreate, onCancelClick}: CreateEvaluationDialogProps) => {
    const [nameInputValue, setNameInputValue] = useState<string>("")
    const [inputErrorMessage, setInputErrorMessage] = useState<string>("")

    const handleCreateClick = () => {
        if(nameInputValue.length < NAME_MIN_LENGTH){
            setInputErrorMessage(`Name must be at least ${NAME_MIN_LENGTH} characters long`)
        }
        else {
            onCreate(nameInputValue)
        }
    }

    const onInputChange = (name: string) => {
        setInputErrorMessage("")
        setNameInputValue(name)
    }

    return <>
        <ModalSideSheet
            show={open}
            onClose={onCancelClick}
            header="Create Evaluation"
            size="medium"
        >
            <Container>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography>
                            In order to revert such a creation you will have to talk with the developers of this application.
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextInput
                            value={nameInputValue}
                            onChange={(v) => onInputChange(v)}
                            placeholder="Evaluation Name"
                        />
                    </Grid>
                    {inputErrorMessage !== "" &&
                    <Grid item xs={12}>
                        <Typography color="danger">{inputErrorMessage}</Typography>
                    </Grid>
                    }
                    <Grid item xs={12}>
                        <Button onClick={handleCreateClick}>
                            Create
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </ModalSideSheet>
    </>
}

export default CreateEvaluationDialog
