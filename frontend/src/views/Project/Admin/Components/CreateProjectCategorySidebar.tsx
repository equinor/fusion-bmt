import React, { useState } from 'react'

import { ApolloError, gql, useMutation } from '@apollo/client'
import { TextField } from '@equinor/eds-core-react'
import { Grid } from '@mui/material'
import SearchableDropdown from '../../../../components/SearchableDropDown'
import { genericErrorMessage } from '../../../../utils/Variables'
import { useEffectNotOnMount, useValidityCheck } from '../../../../utils/hooks'
import { ErrorIcon, TextFieldChangeEvent } from '../../../../components/Action/utils'
import { ProjectCategory } from '../../../../api/models'
import ErrorBanner from '../../../../components/ErrorBanner'
import CancelAndSaveButton from '../../../../components/CancelAndSaveButton'
import SideSheet from '@equinor/fusion-react-side-sheet'

interface Props {
    isOpen: boolean
    setIsOpen: (val: boolean) => void
    onProjectCategoryCreated: (projectCategory: string, isCopy: boolean) => void
    projectCategories: ProjectCategory[]
}

const CreateProjectCategorySidebar = ({ isOpen, setIsOpen, onProjectCategoryCreated, projectCategories }: Props) => {
    const [projectCategoryName, setProjectCategoryName] = useState<string>('')
    const [projectCategoryToCopy, setProjectCategoryToCopy] = useState<string>('')
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false)

    const { createProjectCategory, projectCategory, loading, error } = useCreateProjectCategoryMutation()
    const {
        copyProjectCategory,
        projectCategory: projectCategoryFromCopy,
        loading: isCreatingProjectCategoryCopy,
        error: errorCreatingProjectCategoryCopy,
    } = useCopyProjectCategoryMutation()

    useEffectNotOnMount(() => {
        if (error !== undefined || errorCreatingProjectCategoryCopy) {
            setShowErrorMessage(true)
        }
    }, [error, errorCreatingProjectCategoryCopy])

    useEffectNotOnMount(() => {
        if (!loading && error === undefined) {
            onProjectCategoryCreated(projectCategory.id, false)
        }
    }, [loading])

    useEffectNotOnMount(() => {
        if (!isCreatingProjectCategoryCopy && errorCreatingProjectCategoryCopy === undefined) {
            onProjectCategoryCreated(projectCategoryFromCopy.id, true)
        }
    }, [isCreatingProjectCategoryCopy])

    const isNameValid = () => projectCategoryName.length > 0

    const { valueValidity } = useValidityCheck<string>(projectCategoryName, isNameValid)

    const projectCategoryOptions: { title: string; id: string; }[] = []

    projectCategories.forEach((projectCategory: ProjectCategory) =>
        projectCategoryOptions.push({
            title: projectCategory.name,
            id: projectCategory.id
        })
    )

    const onCreateProjectCategory = () => {
        if (projectCategoryToCopy) {
            copyProjectCategory(projectCategoryName, projectCategoryToCopy)
        } else {
            createProjectCategory(projectCategoryName)
        }
    }

    return (
        <SideSheet
            isOpen={isOpen}
            minWidth={400}
            onClose={() => {
                setIsOpen(false)
            }}
            >
            <SideSheet.Title title="Create questionnaire template" />
            <SideSheet.SubTitle subTitle="Create a new questionnaire template" />
            <SideSheet.Content>
                <Grid container>
                    {showErrorMessage && (
                        <Grid item xs={12}>
                            <ErrorBanner
                                message={'Could not save questionnaire template. ' + genericErrorMessage}
                                onClose={() => setShowErrorMessage(false)}
                            />
                        </Grid>
                    )}
                    <Grid item xs={12} style={{ marginTop: 20 }}>
                        <TextField
                            data-testid="projectCategoryName"
                            id="name"
                            value={projectCategoryName}
                            autoFocus={true}
                            label="Name"
                            onChange={(event: TextFieldChangeEvent) => {
                                setProjectCategoryName(event.target.value)
                            }}
                            variant={valueValidity}
                            helperText={valueValidity === 'error' ? 'required' : ''}
                            helperIcon={valueValidity === 'error' ? ErrorIcon : <></>}
                        />
                    </Grid>
                    <Grid item xs={12} style={{ marginTop: 20 }}>
                        <SearchableDropdown
                            label="Add questions from questionnaire template (optional)"
                            value={projectCategoryOptions.find(option => option.id === projectCategoryToCopy)?.title}
                            onSelect={option => {
                                const selectedOption = (option as any).nativeEvent.detail.selected[0]
                                setProjectCategoryToCopy(selectedOption.id)
                            }}
                            searchQuery={async (searchTerm: string) => {
                                const filteredOptions = projectCategoryOptions.filter(option => {
                                    return option.title.toLowerCase().includes(searchTerm.toLowerCase())
                                })
                                return filteredOptions
                            } }
                            options={projectCategoryOptions}
                        />
                    </Grid>
                    <Grid container style={{ marginTop: '20px' }}>
                        <CancelAndSaveButton
                            onClickCancel={() => setIsOpen(false)}
                            onClickSave={onCreateProjectCategory}
                            cancelButtonTestId="cancelCreateProjectCategory"
                            saveButtonTestId="saveCreateProjectCategory"
                            isSaving={loading}
                            disableCancelButton={loading}
                            disableSaveButton={!isNameValid() || loading}
                        />
                    </Grid>
                </Grid>
            </SideSheet.Content>
        </SideSheet>
    )
}

export default CreateProjectCategorySidebar

interface CreateProjectCategoryMutationProps {
    createProjectCategory: (name: string) => void
    projectCategory: ProjectCategory
    loading: boolean
    error: ApolloError | undefined
}

const useCreateProjectCategoryMutation = (): CreateProjectCategoryMutationProps => {
    const CREATE_PROJECT_CATEGORY = gql`
        mutation CreateProjectCategory($name: String!) {
            createProjectCategory(name: $name) {
                id
                name
            }
        }
    `

    const [createProjectCategoryApolloFunc, { data, loading, error }] = useMutation(CREATE_PROJECT_CATEGORY)

    const createProjectCategory = (name: string) => {
        createProjectCategoryApolloFunc({ variables: { name } })
    }

    return {
        createProjectCategory,
        projectCategory: data && data.createProjectCategory,
        loading,
        error,
    }
}

interface CopyProjectCategoryMutationProps {
    copyProjectCategory: (name: string, projectCategoryId: string) => void
    projectCategory: ProjectCategory
    loading: boolean
    error: ApolloError | undefined
}

const useCopyProjectCategoryMutation = (): CopyProjectCategoryMutationProps => {
    const COPY_PROJECT_CATEGORY = gql`
        mutation CopyProjectCategory($newName: String!, $projectCategoryId: String!) {
            copyProjectCategory(newName: $newName, projectCategoryId: $projectCategoryId) {
                id
                name
            }
        }
    `

    const [copyProjectCategoryApolloFunc, { data, loading, error }] = useMutation(COPY_PROJECT_CATEGORY)

    const copyProjectCategory = (name: string, projectCategoryId: string) => {
        copyProjectCategoryApolloFunc({ variables: { newName: name, projectCategoryId } })
    }

    return {
        copyProjectCategory,
        projectCategory: data && data.copyProjectCategory,
        loading,
        error,
    }
}
