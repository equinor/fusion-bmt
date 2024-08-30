import { useState, useEffect } from 'react'
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
import { useAppContext } from '../../../../context/AppContext'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'

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
    const { projects, evaluations, evaluationsByProject, currentProject, setCurrentProject, projectOptions } = useAppContext()
    const { loading: loadingProjectCategoryQuery, projectCategories, error: errorProjectCategoryQuery } = useGetAllProjectCategoriesQuery()

    const [nameInputValue, setNameInputValue] = useState<string>('')
    const [selectedProjectCategory, setSelectedProjectCategory] = useState<string | undefined>(undefined)
    const [selectedEvaluation, setSelectedEvaluation] = useState<string | undefined>(undefined)
    const [showCreateErrorMessage, setShowCreateErrorMessage] = useState<boolean>(false)
    const [evaluationOptions, setEvaluationOptions] = useState<any[]>([])
    const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined)

    useEffectNotOnMount(() => {
        if (createEvaluationError !== undefined) {
            setShowCreateErrorMessage(true)
        }
    }, [createEvaluationError])

    const isNameInputValid = () => {
        return nameInputValue.length > 0
    }

    const isProjectSelectionValid = () => {
        return selectedProject !== undefined
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
        if (selectedProjectCategory !== undefined && selectedProject !== undefined) {
            onCreate(nameInputValue, selectedProject.id, selectedProjectCategory, selectedEvaluation)
        }
    }

    const isMissingData =
        evaluations === undefined ||
        (currentContext === undefined && (!projects || projects.length === 0)) ||
        projectCategories === undefined ||
        (evaluations === undefined && evaluationsByProject === undefined) ||
        errorProjectCategoryQuery !== undefined

    const isFetchingData = (evaluations === undefined && evaluationsByProject === undefined) || loadingProjectCategoryQuery

    const projectCategoryOptions = projectCategories
        ? projectCategories.map((projectCategory: ProjectCategory) => ({
              title: projectCategory.name,
              id: projectCategory.id,
          }))
        : []

    useEffect(() => {
        if (evaluations && evaluations.length !== evaluationOptions.length ) {
            setEvaluationOptions(evaluations.map((evaluation: Evaluation) => ({
                title: evaluation.name,
                id: evaluation.id,
            })))
        }
    }, [evaluations, evaluationOptions])

    useEffect(() => {
        if (currentContext && !selectedProject) {
            setSelectedProject(projects.filter(project => project.fusionProjectId === currentContext.id)[0])
        }
        if (!currentContext && selectedProject) {
            setCurrentProject(projects.filter(project => project.externalId === selectedProject.externalId)[0])
        }
    }, [selectedProject, currentContext])
    

    return (
        <SideSheet
            isOpen={open}
            minWidth={400}
            onClose={onCancelClick}
            >
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
                            <Grid item xs={12} style={{ marginTop: '20px' }}>
                                <TextField
                                    data-testid="create_evaluation_dialog_name_text_field"
                                    id="" // avoids error
                                    autoFocus={true}
                                    onChange={(e: any) => {
                                        setNameInputValue(e.target.value)
                                    }}
                                    label="Evaluation title"
                                    variant={nameInputValidity}
                                    helperText={nameInputValidity === 'error' ? 'The evaluation title must be filled out' : ''}
                                    helperIcon={nameInputValidity === 'error' ? ErrorIcon : <></>}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <SearchableDropdown
                                    label="Project"
                                    value={selectedProject?.title || currentProject?.title}
                                    onSelect={(option: Project) => {
                                        if (projects) {
                                            const selectedOption = (option as any).nativeEvent.detail.selected[0]
                                            setSelectedProject(projects.filter(project => project.externalId === selectedOption.id)[0])
                                        }
                                    }}
                                    options={projectOptions}
                                    searchQuery={ async (searchTerm: string) => {
                                        return projectOptions.filter(projectOption => projectOption.title!.toLowerCase().includes(searchTerm.toLowerCase()))
                                    }}
                                    disabled={currentContext !== undefined}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <SearchableDropdown
                                    label="Questionare template"
                                    value={projectCategoryOptions.find(option => option.id === selectedProjectCategory)?.title}
                                    onSelect={option => {
                                        const selectedOption = (option as any).nativeEvent.detail.selected[0]
                                        setSelectedProjectCategory(selectedOption.id)
                                    }}
                                    options={projectCategoryOptions}
                                    searchQuery={ async (searchTerm: string) => {
                                        return projectCategoryOptions.filter(projectCategoryOption => projectCategoryOption.title!.toLowerCase().includes(searchTerm.toLowerCase()))
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
                                    searchQuery={ async (searchTerm: string) => {
                                        return evaluationOptions.filter(evaluationOption => evaluationOption.title!.toLowerCase().includes(searchTerm.toLowerCase()))
                                    }}
                                    required={false}
                                />

                            </Grid>
                            <Grid item xs={12}>
                                <CancelAndSaveButton
                                    onClickSave={handleCreateClick}
                                    onClickCancel={onCancelClick}
                                    saveButtonTestId="create_evaluation_dialog_create_button"
                                    disableCancelButton={creatingEvaluation}
                                    disableSaveButton={!isNameInputValid() || !isProjectSelectionValid() || !isCategorySelectionValid()}
                                    isSaving={creatingEvaluation}
                                    isCreate
                                />
                            </Grid>
                        </Grid>
                    </div>
                )}
            </SideSheet.Content>
        </SideSheet>
    )
}

export default CreateEvaluationDialog

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
