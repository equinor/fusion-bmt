import React, { useState } from 'react'

import {
    Button,
    ModalSideSheet,
    SearchableDropdown,
    SearchableDropdownOption,
    TextArea,
} from '@equinor/fusion-components'
import { TextField, Typography } from '@equinor/eds-core-react'
import { Container, Grid } from '@material-ui/core'
import { useGetAllEvaluationsQuery } from './ProjectDashboardGQL'
import { useProject } from '../../../globals/contexts'

interface CreateEvaluationDialogProps {
    open: boolean
    onCreate: (name: string, previousEvaluationId?: string) => void
    onCancelClick: () => void
}

const CreateEvaluationDialog = ({
    open,
    onCreate,
    onCancelClick,
}: CreateEvaluationDialogProps) => {
    const project = useProject()
    const [nameInputValue, setNameInputValue] = useState<string>('')
    const [inputErrorMessage, setInputErrorMessage] = useState<string>('')
    const [selectedEvaluation, setSelectedEvaluation] = useState<
        string | undefined
    >(undefined)

    const handleCreateClick = () => {
        if (nameInputValue.length <= 0) {
            setInputErrorMessage(`The evaluation name must be filled out`)
        } else {
            onCreate(nameInputValue, selectedEvaluation)
        }
    }

    const onInputChange = (name: string) => {
        setInputErrorMessage('')
        setNameInputValue(name)
    }

    const {
        loading: loadingQuery,
        evaluations,
        error: errorQuery,
    } = useGetAllEvaluationsQuery(project.id)

    if (loadingQuery) {
        return <>Loading...</>
    }

    if (errorQuery !== undefined) {
        return (
            <div>
                <TextArea
                    value={`Error in loading evaluations: ${JSON.stringify(
                        errorQuery
                    )}`}
                    onChange={() => {}}
                />
            </div>
        )
    }

    if (evaluations === undefined) {
        return (
            <div>
                <TextArea
                    value={`Error in loading evaluations(undefined): ${JSON.stringify(
                        evaluations
                    )}`}
                    onChange={() => {}}
                />
            </div>
        )
    }

    const evaluationOptions: SearchableDropdownOption[] = evaluations.map(
        evaluation => ({
            title: evaluation.name,
            key: evaluation.id,
            isSelected: evaluation.id === selectedEvaluation,
        })
    )

    return (
        <>
            <ModalSideSheet show={open} onClose={onCancelClick} header="Create Evaluation" size="medium">
                <Container>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography>
                                In order to revert such a creation you will have to talk with the developers of this application.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="" // avoids error
                                autoFocus={true}
                                onChange={(e: any) => {
                                    onInputChange(e.target.value)
                                }}
                                placeholder="Evaluation Name"
                                onKeyPress={(e: any) => {
                                    if (e.key === 'Enter') {
                                        handleCreateClick()
                                    }
                                }}
                                data-testid="create_evaluation_dialog_name_text_field"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <SearchableDropdown
                                label="Previous Evaluation (Optional)"
                                placeholder="Select previous evaluation"
                                onSelect={option =>
                                    setSelectedEvaluation(option.key)
                                }
                                options={evaluationOptions}
                            />
                        </Grid>
                        {inputErrorMessage !== '' && (
                            <Grid item xs={12}>
                                <Typography color="danger">{inputErrorMessage}</Typography>
                            </Grid>
                        )}
                        <Grid item xs={12} data-testid="create_evaluation_dialog_create_button_grid">
                            <Button onClick={handleCreateClick}>Create</Button>
                        </Grid>
                    </Grid>
                </Container>
            </ModalSideSheet>
        </>
    )
}

export default CreateEvaluationDialog
