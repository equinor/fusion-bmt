import React, { useState } from 'react'
import { ApolloError, gql, useQuery } from '@apollo/client'

import { Button, ModalSideSheet, SearchableDropdown, SearchableDropdownOption, TextArea } from '@equinor/fusion-components'
import { TextField, Typography } from '@equinor/eds-core-react'
import { Container, Grid } from '@material-ui/core'
import { useProject } from '../../../globals/contexts'
import { apiErrorMessage } from '../../../api/error'
import { Evaluation, ProjectCategory } from '../../../api/models'

interface CreateEvaluationDialogProps {
    open: boolean
    onCreate: (name: string, projectCategoryId: string, previousEvaluationId?: string) => void
    onCancelClick: () => void
}

const CreateEvaluationDialog = ({ open, onCreate, onCancelClick }: CreateEvaluationDialogProps) => {
    const project = useProject()
    const [nameInputValue, setNameInputValue] = useState<string>('')
    const [inputErrorMessage, setInputErrorMessage] = useState<string>('')
    const [selectedEvaluation, setSelectedEvaluation] = useState<string | undefined>(undefined)

    const [selectedProjectCategory, setSelectedProjectCategory] = useState<string | undefined>(undefined)

    const handleCreateClick = () => {
        if (nameInputValue.length <= 0) {
            setInputErrorMessage(`The evaluation name must be filled out`)
        } else if (selectedProjectCategory === undefined) {
            setInputErrorMessage('A Project Category must be selected')
        } else {
            onCreate(nameInputValue, selectedProjectCategory, selectedEvaluation)
        }
    }

    const onInputChange = (name: string) => {
        setInputErrorMessage('')
        setNameInputValue(name)
    }

    const { loading: loadingEvaluationQuery, evaluations, error: errorEvaluationQuery } = useGetAllEvaluationsQuery(project.id)

    const { loading: loadingProjectCategoryQuery, projectCategories, error: errorProjectCategoryQuery } = useGetAllProjectCategoriesQuery()

    if (loadingEvaluationQuery || loadingProjectCategoryQuery) {
        return <>Loading...</>
    }

    if (errorEvaluationQuery !== undefined || evaluations === undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not load evaluations')} onChange={() => {}} />
            </div>
        )
    }

    if (errorProjectCategoryQuery !== undefined || projectCategories === undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not load Project Categorie')} onChange={() => {}} />
            </div>
        )
    }

    const projectCategoryOptions: SearchableDropdownOption[] = projectCategories.map((projectCategory: ProjectCategory) => ({
        title: projectCategory.name,
        key: projectCategory.id,
        isSelected: projectCategory.id == selectedProjectCategory,
    }))

    const evaluationOptions: SearchableDropdownOption[] = evaluations.map((evaluation: Evaluation) => ({
        title: evaluation.name,
        key: evaluation.id,
        isSelected: evaluation.id === selectedEvaluation,
    }))

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
                                label="Project Category"
                                placeholder="Select Project Category"
                                onSelect={option => setSelectedProjectCategory(option.key)}
                                options={projectCategoryOptions}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <SearchableDropdown
                                label="Previous Evaluation (Optional)"
                                placeholder="Select previous evaluation"
                                onSelect={option => setSelectedEvaluation(option.key)}
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
        query ($projectId: String!) {
            evaluations(where: { project: { id: { eq: $projectId } } }) {
                id
                name
            }
        }
    `

    const { loading, data, error } = useQuery<{ evaluations: Evaluation[] }>(GET_EVALUATIONS, { variables: { projectId } })

    return {
        loading,
        evaluations: data?.evaluations,
        error,
    }
}

interface ProjectCategoriesQueryProps {
    loading: boolean
    projectCategories: ProjectCategory[] | undefined
    error: ApolloError | undefined
}

const useGetAllProjectCategoriesQuery = (): ProjectCategoriesQueryProps => {
    const GET_PROJECT_CATEGORY = gql`
        query {
            projectCategory {
                id
                name
            }
        }
    `
    const { loading, data, error } = useQuery<{ projectCategory: ProjectCategory[] }>(GET_PROJECT_CATEGORY)

    return {
        loading,
        projectCategories: data?.projectCategory,
        error,
    }
}
