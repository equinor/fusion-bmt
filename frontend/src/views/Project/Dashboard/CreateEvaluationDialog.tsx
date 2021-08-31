import React, { useState } from 'react'
import { ApolloError, gql, useQuery } from '@apollo/client'

import {
    Button,
    ModalSideSheet,
    SearchableDropdown,
    SearchableDropdownOption,
    TextArea,
} from '@equinor/fusion-components'
import { TextField, Typography } from '@equinor/eds-core-react'
import { Container, Grid } from '@material-ui/core'
import { useProject } from '../../../globals/contexts'
import { apiErrorMessage } from '../../../api/error'
import { Evaluation } from '../../../api/models'

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

    if (errorQuery !== undefined || evaluations === undefined) {
        return (
            <div>
                <TextArea
                    value={apiErrorMessage('Could not load evaluations')}
                    onChange={() => {}}
                />
            </div>
        )
    }

    const evaluationOptions: SearchableDropdownOption[] = evaluations.map(
        (evaluation: Evaluation) => ({
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

interface EvaluationsQueryProps {
    loading: boolean
    evaluations: Evaluation[] | undefined
    error: ApolloError | undefined
}

const useGetAllEvaluationsQuery = (projectId: string): EvaluationsQueryProps => {
    const GET_EVALUATIONS = gql`
        query($projectId: String!) {
            evaluations(where: { project: { id: { eq: $projectId } } }) {
                id
                name
            }
        }
    `

    const { loading, data, error } = useQuery<{ evaluations: Evaluation[] }>(
        GET_EVALUATIONS,
        { variables: { projectId } }
    )

    return {
        loading,
        evaluations: data?.evaluations,
        error,
    }
}
