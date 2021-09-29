import React, { useState } from 'react'
import { ApolloError, gql, useMutation } from '@apollo/client'
import { ModalSideSheet, SearchableDropdown, SearchableDropdownOption } from '@equinor/fusion-components'
import { Button, TextField } from '@equinor/eds-core-react'
import { Grid } from '@material-ui/core'

import { useSavingStateCheck, useValidityCheck } from '../../utils/hooks'
import { ErrorIcon, TextFieldChangeEvent } from '../../components/Action/utils'
import { ProjectCategory } from '../../api/models'
import SaveIndicator from '../../components/SaveIndicator'
import ErrorMessage from './Components/ErrorMessage'

interface Props {
    isOpen: boolean
    setIsOpen: (val: boolean) => void
    onProjectCategoryCreated: (value: string, value2: boolean) => void
    projectCategories: ProjectCategory[]
}

const CreateProjectCategorySidebar = ({ isOpen, setIsOpen, onProjectCategoryCreated, projectCategories }: Props) => {
    const [projectCategoryName, setProjectCategoryName] = useState<string>('')
    const [projectCategoryToCopy, setProjectCategoryToCopy] = useState<string>('')
    const { createProjectCategory, projectCategory, loading, error } = useCreateProjectCategoryMutation()
    const {
        copyProjectCategory,
        projectCategory: projectCategoryFromCopy,
        loading: isCreatingProjectCategoryCopy,
        error: errorCreatingProjectCategoryCopy,
    } = useCopyProjectCategoryMutation()

    const isNameValid = () => projectCategoryName.length > 0

    const doWhenProjectCategorySaved = () => {
        if (projectCategoryToCopy) {
            onProjectCategoryCreated(projectCategoryFromCopy.id, true)
        } else {
            onProjectCategoryCreated(projectCategory.id, false)
        }
    }

    const { valueValidity } = useValidityCheck<string>(projectCategoryName, isNameValid)
    const { savingState } = useSavingStateCheck(
        loading || isCreatingProjectCategoryCopy,
        error !== undefined || errorCreatingProjectCategoryCopy !== undefined,
        doWhenProjectCategorySaved
    )

    const projectCategoryOptions: SearchableDropdownOption[] = []

    projectCategories.forEach((projectCategory: ProjectCategory) =>
        projectCategoryOptions.push({
            title: projectCategory.name,
            key: projectCategory.id,
            isSelected: projectCategory.id === projectCategoryToCopy,
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
        <ModalSideSheet
            header={`Create Project Category`}
            show={isOpen}
            size="medium"
            onClose={() => {
                setIsOpen(false)
            }}
            isResizable={false}
            headerIcons={[<SaveIndicator savingState={savingState} />]}
        >
            <Grid container style={{ padding: 20 }}>
                <Grid item xs={12}>
                    <TextField
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
                        label="Add questions from project category (optional)"
                        placeholder="Add questions from project category (optional)"
                        onSelect={option => setProjectCategoryToCopy(option.key)}
                        options={projectCategoryOptions}
                    />
                </Grid>
                <Grid container justify="flex-end" style={{ marginTop: '20px' }}>
                    <Button variant="outlined" style={{ marginRight: '10px' }} onClick={() => setIsOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={onCreateProjectCategory} disabled={!isNameValid() || loading}>
                        Save
                    </Button>
                </Grid>
                {(error !== undefined || errorCreatingProjectCategoryCopy !== undefined) && (
                    <Grid item xs={12} style={{ marginTop: '20px' }}>
                        <ErrorMessage text={'Could not save Project Category'} />
                    </Grid>
                )}
            </Grid>
        </ModalSideSheet>
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
