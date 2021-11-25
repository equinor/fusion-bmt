import React, { useState } from 'react'
import { ApolloError, gql, useQuery } from '@apollo/client'

import { ErrorMessage, ModalSideSheet, SearchableDropdown, SearchableDropdownOption } from '@equinor/fusion-components'
import { CircularProgress, TextField } from '@equinor/eds-core-react'
import { Container, Grid } from '@material-ui/core'

import { genericErrorMessage } from '../../../../utils/Variables'
import { useProject } from '../../../../globals/contexts'
import { useEffectNotOnMount, useValidityCheck } from '../../../../utils/hooks'
import { Evaluation, ProjectCategory } from '../../../../api/models'
import { ErrorIcon } from '../../../../components/Action/utils'
import ErrorBanner from '../../../../components/ErrorBanner'
import CancelAndSaveButton from '../../../../components/CancelAndSaveButton'
import { centered } from '../../../../utils/styles'

interface CreateEvaluationDialogProps {
    open: boolean
    onCreate: (name: string, projectCategoryId: string, previousEvaluationId?: string) => void
    onCancelClick: () => void
    createEvaluationError: ApolloError | undefined
    creatingEvaluation: boolean
}

const CreateEvaluationDialog = ({
    open,
    onCreate,
    onCancelClick,
    createEvaluationError,
    creatingEvaluation,
}: CreateEvaluationDialogProps) => {
    const project = useProject()

    const { loading: loadingEvaluationQuery, evaluations, error: errorEvaluationQuery } = useGetAllEvaluationsQuery(project.id)
    const { loading: loadingProjectCategoryQuery, projectCategories, error: errorProjectCategoryQuery } = useGetAllProjectCategoriesQuery()

    const [nameInputValue, setNameInputValue] = useState<string>('')
    const [selectedProjectCategory, setSelectedProjectCategory] = useState<string | undefined>(undefined)
    const [selectedEvaluation, setSelectedEvaluation] = useState<string | undefined>(undefined)
    const [showCreateErrorMessage, setShowCreateErrorMessage] = useState<boolean>(false)

    useEffectNotOnMount(() => {
        if (createEvaluationError !== undefined) {
            setShowCreateErrorMessage(true)
        }
    }, [createEvaluationError])

    const isNameInputValid = () => {
        return nameInputValue.length > 0
    }

    const isCategorySelectionValid = () => {
        return selectedProjectCategory !== undefined
    }

    const { valueValidity: nameInputValidity } = useValidityCheck<string>(nameInputValue, isNameInputValid)
    const { valueValidity: categorySelectionValidity } = useValidityCheck<string | undefined>(
        selectedProjectCategory,
        isCategorySelectionValid
    )

    const handleCreateClick = () => {
        if (selectedProjectCategory !== undefined) {
            onCreate(nameInputValue, selectedProjectCategory, selectedEvaluation)
        }
    }

    const isMissingData =
        evaluations === undefined ||
        projectCategories === undefined ||
        errorEvaluationQuery !== undefined ||
        errorProjectCategoryQuery !== undefined

    const isFetchingData = loadingEvaluationQuery || loadingProjectCategoryQuery

    const projectCategoryOptions: SearchableDropdownOption[] = projectCategories
        ? projectCategories.map((projectCategory: ProjectCategory) => ({
              title: projectCategory.name,
              key: projectCategory.id,
              isSelected: projectCategory.id == selectedProjectCategory,
          }))
        : []

    const evaluationOptions: SearchableDropdownOption[] = evaluations
        ? evaluations.map((evaluation: Evaluation) => ({
              title: evaluation.name,
              key: evaluation.id,
              isSelected: evaluation.id === selectedEvaluation,
          }))
        : []

    return (
        <>
            <ModalSideSheet show={open} onClose={onCancelClick} header="Create Evaluation" size="medium">
                {isFetchingData && (
                    <div style={centered}>
                        <CircularProgress style={{ width: '25px', height: '25px' }} />
                    </div>
                )}
                {!isFetchingData && isMissingData && (
                    <ErrorMessage
                        hasError
                        title="Missing data"
                        errorType={'noData'}
                        message={'Unfortunately, we were not able to fetch the necessary data. ' + genericErrorMessage}
                    />
                )}
                {!isFetchingData && !isMissingData && (
                    <Container>
                        {showCreateErrorMessage && (
                            <ErrorBanner
                                message={'Unable to create evaluation. ' + genericErrorMessage}
                                onClose={() => setShowCreateErrorMessage(false)}
                            />
                        )}
                        <Grid container spacing={3}>
                            <Grid item xs={12} style={{ marginTop: '20px' }}>
                                <TextField
                                    data-testid="create_evaluation_dialog_name_text_field"
                                    id="" // avoids error
                                    autoFocus={true}
                                    onChange={(e: any) => {
                                        setNameInputValue(e.target.value)
                                    }}
                                    label="Evaluation name (required)"
                                    onKeyPress={(e: any) => {
                                        if (e.key === 'Enter') {
                                            handleCreateClick()
                                        }
                                    }}
                                    variant={nameInputValidity}
                                    helperText={nameInputValidity === 'error' ? 'The evaluation name must be filled out' : ''}
                                    helperIcon={nameInputValidity === 'error' ? ErrorIcon : <></>}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <SearchableDropdown
                                    label="Project Category (required)"
                                    placeholder="Select Project Category"
                                    onSelect={option => setSelectedProjectCategory(option.key)}
                                    options={projectCategoryOptions}
                                    error={categorySelectionValidity === 'error'}
                                    errorMessage="A Project Category must be selected"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <SearchableDropdown
                                    label="Previous evaluation (optional)"
                                    placeholder="Select previous evaluation"
                                    onSelect={option => setSelectedEvaluation(option.key)}
                                    options={evaluationOptions}
                                />
                            </Grid>
                            <Grid container justify="flex-end" style={{ margin: '20px 12px' }}>
                                <CancelAndSaveButton
                                    onClickSave={handleCreateClick}
                                    onClickCancel={onCancelClick}
                                    saveButtonTestId="create_evaluation_dialog_create_button"
                                    disableCancelButton={creatingEvaluation}
                                    disableSaveButton={!isNameInputValid() || !isCategorySelectionValid()}
                                    isSaving={creatingEvaluation}
                                />
                            </Grid>
                        </Grid>
                    </Container>
                )}
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
