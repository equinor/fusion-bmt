import React, { useState } from 'react'
import { Box } from '@mui/material'
import { ApolloError, gql, useMutation } from '@apollo/client'
import SearchableDropdown from '../../../../components/SearchableDropDown'
import { Button, Icon, Tooltip } from '@equinor/eds-core-react'
import { add, delete_to_trash } from '@equinor/eds-icons'
import { ProjectCategory } from '../../../../api/models'
import { useEffectNotOnMount, useShowErrorHook } from '../../../../utils/hooks'
import ConfirmationDialog from '../../../../components/ConfirmationDialog'
import CreateProjectCategorySidebar from './CreateProjectCategorySidebar'
import { genericErrorMessage } from '../../../../utils/Variables'
import ErrorBanner from '../../../../components/ErrorBanner'

interface Props {
    selectedProjectCategory: string
    setSelectedProjectCategory: (val: string) => void
    projectCategories: ProjectCategory[]
    refetchProjectCategories: () => void
    refetchQuestionTemplates: () => void
}

const CategoryHeader = ({
    selectedProjectCategory,
    setSelectedProjectCategory,
    projectCategories,
    refetchProjectCategories,
    refetchQuestionTemplates,
}: Props) => {
    const [isInCreateProjectCategoryMode, setIsInCreateProjectCategoryMode] = useState<boolean>(false)
    const [isInConfirmDeleteMode, setIsInConfirmDeleteMode] = useState<boolean>(false)

    const {
        deleteProjectCategory,
        loading: deletingProjectCategory,
        error: deletingProjectCategoryError,
    } = useDeleteProjectCategoryMutation()

    const { showErrorMessage, setShowErrorMessage } = useShowErrorHook(deletingProjectCategoryError)

    useEffectNotOnMount(() => {
        if (!deletingProjectCategory) {
            setIsInConfirmDeleteMode(false)

            if (deletingProjectCategoryError === undefined) {
                setSelectedProjectCategory('all')
            }
        }
    }, [deletingProjectCategory])

    const projectCategoryOptions = [
        {
            title: 'All questionnaire templates',
            id: 'all',
        },
    ]

    projectCategories.forEach((projectCategory: ProjectCategory) =>
        projectCategoryOptions.push({
            title: projectCategory.name,
            id: projectCategory.id
        })
    )

    const createDeleteConfirmation = () => {
        const projectCategory = projectCategories.find(pc => pc.id === selectedProjectCategory)

        if (projectCategory) {
            return 'Are you sure you want to delete the project category: ' + "'" + projectCategory.name + "'?"
        }

        return 'Are you sure you want to delete the selected project category?'
    }

    const onCreated = (projectCategory: string, isCopy: boolean) => {
        setIsInCreateProjectCategoryMode(false)
        refetchProjectCategories()
        if (isCopy) {
            refetchQuestionTemplates()
        }
        setSelectedProjectCategory(projectCategory)
    }

    return (
        <>
            <Box display={'flex'} flexDirection={'column'} width={'100%'}>
                <Box display={'flex'} flexDirection={'row'}>
                    <Box flexGrow={1}>
                        <Box ml={4} width={'250px'}>
                            <SearchableDropdown
                                label="Questionnaire Template"
                                value={projectCategoryOptions.find(option => option.id === selectedProjectCategory)?.title}
                                onSelect={option => {
                                    const selectedOption = (option as any).nativeEvent.detail.selected[0]
                                    setSelectedProjectCategory(selectedOption.id)
                                }}
                                options={projectCategoryOptions}
                                searchQuery={( async (query: string) => {
                                    return projectCategoryOptions.filter((option) => {
                                        return option.title.toLowerCase().includes(query.toLowerCase())
                                    })
                                })}
                            />
                        </Box>
                    </Box>
                    <Box alignSelf={'center'}>
                        <Button variant="outlined" onClick={() => setIsInCreateProjectCategoryMode(true)} data-testid="addProjectCategory">
                            <Icon data={add}></Icon>
                            Add questionnaire template
                        </Button>
                    </Box>
                    <Box mr={4} ml={1} alignSelf={'center'}>
                        <Tooltip placement="bottom" title={'Delete selected questionnaire template'}>
                            <Button
                                data-testid="deleteProjectCategory"
                                variant="ghost"
                                color="primary"
                                onClick={() => setIsInConfirmDeleteMode(true)}
                                disabled={selectedProjectCategory === 'all'}
                            >
                                <Icon data={delete_to_trash}></Icon>
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
                {showErrorMessage && (
                    <Box mt={1} ml={4} mr={4}>
                        <ErrorBanner
                            message={'Could not delete project category. ' + genericErrorMessage}
                            onClose={() => setShowErrorMessage(false)}
                        />
                    </Box>
                )}
            </Box>
            <ConfirmationDialog
                isOpen={isInConfirmDeleteMode}
                isLoading={deletingProjectCategory}
                title={'Delete project category'}
                description={createDeleteConfirmation()}
                onConfirmClick={() => deleteProjectCategory(selectedProjectCategory)}
                onCancelClick={() => setIsInConfirmDeleteMode(false)}
            />
            {isInCreateProjectCategoryMode && (
                <CreateProjectCategorySidebar
                    isOpen={isInCreateProjectCategoryMode}
                    setIsOpen={setIsInCreateProjectCategoryMode}
                    onProjectCategoryCreated={onCreated}
                    projectCategories={projectCategories}
                />
            )}
        </>
    )
}

export default CategoryHeader

interface DeleteProjectCategoryMutationProps {
    deleteProjectCategory: (projectCategoryId: string) => void
    loading: boolean
    error: ApolloError | undefined
}

const useDeleteProjectCategoryMutation = (): DeleteProjectCategoryMutationProps => {
    const DELETE_PROJECT_CATEGORY = gql`
        mutation DeleteProjectCategory($projectCategoryId: String!) {
            deleteProjectCategory(projectCategoryId: $projectCategoryId) {
                id
            }
        }
    `

    const [deleteProjectCategoryApolloFunc, { loading, data, error }] = useMutation(DELETE_PROJECT_CATEGORY, {
        update(cache, mutationResult) {
            const projectCategoryDeleted = mutationResult.data.deleteProjectCategory
            const id = cache.identify({
                __typename: 'ProjectCategory',
                id: projectCategoryDeleted.id,
            })
            cache.evict({ id })
        },
    })

    const deleteProjectCategory = (projectCategoryId: string) => {
        deleteProjectCategoryApolloFunc({
            variables: { projectCategoryId },
        })
    }

    return {
        deleteProjectCategory,
        loading,
        error,
    }
}
