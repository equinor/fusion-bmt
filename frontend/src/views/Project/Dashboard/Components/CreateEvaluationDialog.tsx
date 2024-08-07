import { useState } from 'react'
import { ApolloError, gql, useQuery } from '@apollo/client'

import ErrorMessage from '../../../../components/ErrorMessage'
import { CircularProgress, TextField } from '@equinor/eds-core-react'
import { Grid } from '@mui/material'
import SearchableDropdown from '../../../../components/SearchableDropDown'
import { genericErrorMessage } from '../../../../utils/Variables'
import { useEffectNotOnMount, useValidityCheck } from '../../../../utils/hooks'
import { Evaluation, Project, ProjectCategory } from '../../../../api/models'
import { ErrorIcon } from '../../../../components/Action/utils'
import ErrorBanner from '../../../../components/ErrorBanner'
import CancelAndSaveButton from '../../../../components/CancelAndSaveButton'
import { centered } from '../../../../utils/styles'
import SideSheet from '@equinor/fusion-react-side-sheet'
import styled from 'styled-components'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'
import SearchableProjectDropdown from '../../../../components/SearchableProjectDropdown'
import { useAppContext } from '../../../../context/AppContext'

const ButtonGrid = styled(Grid)`
    margin: 20px 10px;
    display: flex;
    justify-content: end;
`

interface InputCheck {
    valid: boolean
    value: string
}
interface CreateEvaluationDialogProps {
    open: boolean
    onCreate: (name: string, projectId: string, projectCategoryId: string, previousEvaluationId?: string) => void
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
    const { currentContext } = useModuleCurrentContext()

    const { currentProject } = useAppContext()

    const { loading: loadingEvaluationQuery, evaluations, error: errorEvaluationQuery } = useGetAllEvaluationsQuery(currentContext?.id)
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

    const invalidInput: InputCheck = {
        valid: false,
        value: ''
    }
    const evaluationTitleCheck = ():InputCheck => {
        if (nameInputValue.length > 0 && typeof nameInputValue === 'string') {
            return {valid: true, value: nameInputValue}
        }
        return invalidInput
    }

    const selectedProjectCheck = ():InputCheck => {
        if (currentProject !== undefined && currentProject.id !== null && typeof currentProject.id === 'string') {
            return {valid: true, value: currentProject.id}
        }
        return invalidInput
    }

    const selectedCategoryCheck = ():InputCheck => {
        if (selectedProjectCategory !== undefined && typeof selectedProjectCategory === 'string') {
            return {valid: true, value: selectedProjectCategory}
        }
        return invalidInput
    }

    const handleCreateClick = () => {
        if (evaluationTitleCheck().valid && selectedProjectCheck().valid && selectedCategoryCheck().valid) {
            onCreate(evaluationTitleCheck().value, selectedProjectCheck().value, selectedCategoryCheck().value)
        }
    }

    const isMissingData =
        projectCategories === undefined ||
        errorEvaluationQuery !== undefined ||
        errorProjectCategoryQuery !== undefined

    const isFetchingData = loadingEvaluationQuery || loadingProjectCategoryQuery

    const projectCategoryOptions = projectCategories
        ? projectCategories.map((projectCategory: ProjectCategory) => ({
              title: projectCategory.name,
              id: projectCategory.id,
          }))
        : []

    const evaluationOptions = evaluations
        ? evaluations.map((evaluation: Evaluation) => ({
              title: evaluation.name,
              id: evaluation.id,
          }))
        : []

    return (
        <SideSheet isOpen={open} minWidth={400} onClose={onCancelClick}>
            <SideSheet.Title title="Create new evaluation" />
            <SideSheet.SubTitle subTitle="" />
            <SideSheet.Content>
                {isFetchingData && (
                    <div style={centered}>
                        <CircularProgress style={{ width: '25px', height: '25px' }} />
                    </div>
                )}
                {!isFetchingData && isMissingData && (
                    <ErrorMessage
                        title="Missing data"
                        message={'Unfortunately, we were not able to fetch the necessary data. ' + genericErrorMessage}
                    />
                )}
                {!isFetchingData && !isMissingData && (
                    <div>
                        {showCreateErrorMessage && (
                            <ErrorBanner
                                message={'Unable to create evaluation. ' + genericErrorMessage}
                                onClose={() => setShowCreateErrorMessage(false)}
                            />
                        )}
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    data-testid="create_evaluation_dialog_name_text_field"
                                    id="" // avoids error
                                    autoFocus={true}
                                    onChange={(e: any) => {
                                        setNameInputValue(e.target.value)
                                    }}
                                    label="Evaluation title"
                                    onKeyUp={(e: any) => {
                                        if (e.key === 'Enter') {
                                            handleCreateClick()
                                        }
                                    }}
                                    variant={evaluationTitleCheck().valid ? "success" : "error"}
                                    helperText={!evaluationTitleCheck().valid ? 'The evaluation title must be filled out' : ''}
                                    helperIcon={!evaluationTitleCheck().valid ? ErrorIcon : <></>}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <SearchableProjectDropdown />
                            </Grid>
                            <Grid item xs={12}>
                                <SearchableDropdown
                                    label="Project Category"
                                    value={projectCategoryOptions.find(option => option.id === selectedProjectCategory)?.title}
                                    onSelect={option => {
                                        const selectedOption = (option as any).nativeEvent.detail.selected[0]
                                        setSelectedProjectCategory(selectedOption.id)
                                    }}
                                    options={projectCategoryOptions}
                                    searchQuery={async (searchTerm: string) => {
                                        return projectCategoryOptions
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <SearchableDropdown
                                    label="Previous evaluation"
                                    value={evaluationOptions.find(option => option.id === selectedEvaluation)?.title}
                                    onSelect={option => {
                                        const selectedOption = (option as any).nativeEvent.detail.selected[0]
                                        setSelectedEvaluation(selectedOption.id)
                                    }}
                                    options={evaluationOptions}
                                    searchQuery={async (searchTerm: string) => {
                                        return evaluationOptions
                                    }}
                                    required={false}
                                />
                            </Grid>
                            <ButtonGrid container>
                                <CancelAndSaveButton
                                    onClickSave={handleCreateClick}
                                    onClickCancel={onCancelClick}
                                    saveButtonTestId="create_evaluation_dialog_create_button"
                                    disableCancelButton={creatingEvaluation}
                                    disableSaveButton={!evaluationTitleCheck().valid || !selectedCategoryCheck().valid || !selectedProjectCheck().valid || !currentProject}
                                    isSaving={creatingEvaluation}
                                />
                            </ButtonGrid>
                        </Grid>
                    </div>
                )}
            </SideSheet.Content>
        </SideSheet>
    )
}

export default CreateEvaluationDialog

interface EvaluationsQueryProps {
    loading: boolean
    evaluations: Evaluation[] | undefined
    error: ApolloError | undefined
}

const useGetAllEvaluationsQuery = (projectId?: string): EvaluationsQueryProps => {
    if (projectId) {
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
    return {
        loading: false,
        evaluations: undefined,
        error: undefined,
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
