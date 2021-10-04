import React, { RefObject, useRef, useState } from 'react'
import { tokens } from '@equinor/eds-tokens'
import { MarkdownViewer, TextArea } from '@equinor/fusion-components'
import { Button, Chip, Icon, MultiSelect, Tooltip, Typography } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'
import { edit, more_vertical, platform, work } from '@equinor/eds-icons'

import { ProjectCategory, QuestionTemplate } from '../../api/models'
import { organizationToString } from '../../utils/EnumToString'
import QuestionTemplateMenu from './QuestionTemplateMenu'
import { UseMultipleSelectionStateChange } from 'downshift'
import { ApolloError, gql, useMutation } from '@apollo/client'
import SaveIndicator from '../../components/SaveIndicator'
import { SavingState } from '../../utils/Variables'
import { deriveNewSavingState } from '../helpers'
import { apiErrorMessage } from '../../api/error'
import { useEffectNotOnMount } from '../../utils/hooks'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import ErrorMessage from './Components/ErrorMessage'

interface Props {
    question: QuestionTemplate
    setIsInEditmode: (inEditmode: boolean) => void
    projectCategories: ProjectCategory[]
    isInAddCategoryMode: boolean
    questionTitleRef: RefObject<HTMLElement>
}

const StaticQuestionItem = ({ question, setIsInEditmode, projectCategories, isInAddCategoryMode, questionTitleRef }: Props) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [savingState, setSavingState] = useState<SavingState>(SavingState.None)
    const [isInConfirmDeleteMode, setIsInConfirmDeleteMode] = useState<boolean>(false)
    const anchorRef = useRef<HTMLButtonElement>(null)
    const projectCategoriesOptions = [...projectCategories].map(category => category.name)

    const {
        addToProjectCategory,
        loading: addingToProjectCategory,
        error: addingToProjectCategoryError,
    } = useAddToProjectCategoryMutation()

    const {
        removeFromProjectCategory,
        loading: removingFromProjectCategory,
        error: removingFromProjectCategoryError,
    } = useRemoveFromProjectCategoryMutation()

    const {
        deleteQuestionTemplate,
        loading: deletingQuestionTemplate,
        error: deletingQuestionTemplateError,
    } = useDeleteQuestionTemplateMutation()

    useEffectNotOnMount(() => {
        setSavingState(deriveNewSavingState(addingToProjectCategory, savingState, addingToProjectCategoryError !== undefined))
    }, [addingToProjectCategory])

    useEffectNotOnMount(() => {
        setSavingState(deriveNewSavingState(removingFromProjectCategory, savingState, removingFromProjectCategoryError !== undefined))
    }, [removingFromProjectCategory])

    useEffectNotOnMount(() => {
        if (deletingQuestionTemplateError !== undefined) {
            setIsInConfirmDeleteMode(false)
        }
    }, [deletingQuestionTemplateError])

    useEffectNotOnMount(() => {
        if (deletingQuestionTemplate === false) {
            setIsInConfirmDeleteMode(false)
        }
    }, [deletingQuestionTemplate])

    const checkIfAddedCategory = (selection: string[]): ProjectCategory | undefined => {
        let newItem: ProjectCategory | undefined = undefined

        selection.forEach(selectedCategoryString => {
            if (
                question.projectCategories.findIndex(questionProjectCategory => questionProjectCategory.name === selectedCategoryString) < 0
            ) {
                newItem = projectCategories.find(projectCategory => projectCategory.name === selectedCategoryString)
            }
        })

        return newItem
    }

    const checkIfRemovedCategory = (selection: string[]): ProjectCategory | undefined => {
        let deletedItem = undefined

        question.projectCategories.forEach(questionProjectCategory => {
            if (selection.findIndex(selectedCategoryString => selectedCategoryString === questionProjectCategory.name) < 0) {
                deletedItem = questionProjectCategory
            }
        })

        return deletedItem
    }

    const updateProjectCategories = (selection: string[] | undefined) => {
        if (selection) {
            const addedItemInSelection = checkIfAddedCategory(selection)
            const removedItemInSelection = checkIfRemovedCategory(selection)

            if (addedItemInSelection) {
                addToProjectCategory({
                    questionTemplateId: question.id,
                    projectCategoryId: addedItemInSelection.id,
                })
            }

            if (removedItemInSelection) {
                removeFromProjectCategory({
                    questionTemplateId: question.id,
                    projectCategoryId: removedItemInSelection.id,
                })
            }
        }
    }

    return (
        <>
            <Box display="flex" flexDirection="column">
                <Box display="flex" flexDirection="row">
                    <Box display="flex" flexGrow={1} mb={3} mr={5}>
                        <Box ml={2} mr={1}>
                            <Typography variant="h4" data-testid={'question-number-' + question.order}>
                                {question.order}.
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="h4" ref={questionTitleRef} data-testid={'question-title-' + question.order}>
                                {question.text}
                            </Typography>
                            <Box display="flex" flexDirection="row" flexWrap="wrap" mb={2} mt={1} alignItems={'center'}>
                                <Box mr={1} mb={1}>
                                    <Chip
                                        style={{ backgroundColor: tokens.colors.infographic.primary__spruce_wood.rgba }}
                                        data-testid={'organization-' + question.order}
                                    >
                                        <Tooltip title={'Organization'} placement={'bottom'}>
                                            <Icon data={work} size={16}></Icon>
                                        </Tooltip>
                                        {organizationToString(question.organization)}
                                    </Chip>
                                </Box>
                                {question.projectCategories.map((category, index) => (
                                    <Box mr={1} mb={1} key={index}>
                                        <Chip style={{ backgroundColor: tokens.colors.infographic.primary__mist_blue.rgba }}>
                                            <Tooltip title={'Project category'} placement={'bottom'}>
                                                <Icon data={platform} size={16}></Icon>
                                            </Tooltip>
                                            {category.name}
                                        </Chip>
                                    </Box>
                                ))}
                                {isInAddCategoryMode && (
                                    <Box width={200} mb={1}>
                                        <MultiSelect
                                            label=""
                                            items={projectCategoriesOptions}
                                            initialSelectedItems={question.projectCategories.map(cat => cat.name)}
                                            handleSelectedItemsChange={(changes: UseMultipleSelectionStateChange<string>) => {
                                                updateProjectCategories(changes.selectedItems)
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                            <Box mt={3}>
                                <MarkdownViewer markdown={question.supportNotes} />
                            </Box>
                        </Box>
                    </Box>
                    <Box display="flex" flexDirection={'column'}>
                        <Box flexGrow={1} style={{ minWidth: '120px' }}>
                            <Button
                                variant="ghost"
                                color="primary"
                                onClick={() => setIsInEditmode(true)}
                                data-testid={'edit-question-' + question.order}
                            >
                                <Icon data={edit}></Icon>
                            </Button>
                            <Button
                                variant="ghost"
                                color="primary"
                                ref={anchorRef}
                                onClick={() => (isOpen ? setIsOpen(false) : setIsOpen(true))}
                                data-testid={'move-delete-question-' + question.order}
                            >
                                <Icon data={more_vertical}></Icon>
                            </Button>
                        </Box>
                        <Box alignSelf={'flex-end'} mr={2}>
                            <SaveIndicator savingState={savingState} />
                        </Box>
                    </Box>
                    <QuestionTemplateMenu
                        isOpen={isOpen}
                        anchorRef={anchorRef}
                        closeMenu={() => setIsOpen(false)}
                        onDeleteClick={() => setIsInConfirmDeleteMode(true)}
                    />
                    <ConfirmationDialog
                        isOpen={isInConfirmDeleteMode}
                        title={'Delete question template'}
                        description={'Are you sure you want to delete the question: ' + "'" + question.text + "'"}
                        onConfirmClick={() => deleteQuestionTemplate(question.id)}
                        onCancelClick={() => setIsInConfirmDeleteMode(false)}
                    />
                </Box>
                {deletingQuestionTemplateError !== undefined && <ErrorMessage text={'Could not delete question template'} />}
            </Box>
            {addingToProjectCategoryError && (
                <Box mt={2} ml={4}>
                    <Box>
                        <TextArea value={apiErrorMessage('Not able to add project category to question template')} onChange={() => {}} />
                    </Box>
                </Box>
            )}
            {removingFromProjectCategoryError && (
                <Box mt={2} ml={4}>
                    <Box>
                        <TextArea
                            value={apiErrorMessage('Not able to remove project category from question template')}
                            onChange={() => {}}
                        />
                    </Box>
                </Box>
            )}
        </>
    )
}

export default StaticQuestionItem

export interface DataToAddToOrRemoveFromProjectCategory {
    questionTemplateId: string
    projectCategoryId: string
}

interface AddToProjectCategoryMutationProps {
    addToProjectCategory: (data: DataToAddToOrRemoveFromProjectCategory) => void
    loading: boolean
    error: ApolloError | undefined
}

const useAddToProjectCategoryMutation = (): AddToProjectCategoryMutationProps => {
    const ADD_TO_PROJECT_CATEGORY = gql`
        mutation AddToProjectCategory($questionTemplateId: String!, $projectCategoryId: String!) {
            addToProjectCategory(questionTemplateId: $questionTemplateId, projectCategoryId: $projectCategoryId) {
                id
                projectCategories {
                    id
                    name
                }
            }
        }
    `

    const [addToProjectCategoryApolloFunc, { loading, data, error }] = useMutation(ADD_TO_PROJECT_CATEGORY, {
        update(cache, mutationResult) {
            const questionTemplateAddedTo = mutationResult.data.addToProjectCategory
            cache.modify({
                id: cache.identify({
                    __typename: 'QuestionTemplate',
                    id: questionTemplateAddedTo.id,
                }),
                fields: {
                    projectCategories() {
                        return questionTemplateAddedTo.projectCategories
                    },
                },
            })
        },
    })

    const addToProjectCategory = (data: DataToAddToOrRemoveFromProjectCategory) => {
        addToProjectCategoryApolloFunc({
            variables: { ...data },
        })
    }

    return {
        addToProjectCategory,
        loading,
        error,
    }
}

interface RemoveFromProjectCategoryMutationProps {
    removeFromProjectCategory: (data: DataToAddToOrRemoveFromProjectCategory) => void
    loading: boolean
    error: ApolloError | undefined
}

const useRemoveFromProjectCategoryMutation = (): RemoveFromProjectCategoryMutationProps => {
    const REMOVE_FROM_PROJECT_CATEGORY = gql`
        mutation RemoveFromProjectCategory($questionTemplateId: String!, $projectCategoryId: String!) {
            removeFromProjectCategory(questionTemplateId: $questionTemplateId, projectCategoryId: $projectCategoryId) {
                id
                projectCategories {
                    id
                    name
                }
            }
        }
    `

    const [removeFromProjectCategoryApolloFunc, { loading, data, error }] = useMutation(REMOVE_FROM_PROJECT_CATEGORY, {
        update(cache, mutationResult) {
            const questionTemplateRemovedFrom = mutationResult.data.removeFromProjectCategory
            cache.modify({
                id: cache.identify({
                    __typename: 'QuestionTemplate',
                    id: questionTemplateRemovedFrom.id,
                }),
                fields: {
                    projectCategories() {
                        return questionTemplateRemovedFrom.projectCategories
                    },
                },
            })
        },
    })

    const removeFromProjectCategory = (data: DataToAddToOrRemoveFromProjectCategory) => {
        removeFromProjectCategoryApolloFunc({
            variables: { ...data },
        })
    }

    return {
        removeFromProjectCategory,
        loading,
        error,
    }
}

interface DeleteQuestionTemplateMutationProps {
    deleteQuestionTemplate: (questionTemplateId: string) => void
    loading: boolean
    error: ApolloError | undefined
}

const useDeleteQuestionTemplateMutation = (): DeleteQuestionTemplateMutationProps => {
    const DELETE_QUESTION_TEMPLATE = gql`
        mutation DeleteQuestionTemplate($questionTemplateId: String!) {
            deleteQuestionTemplate(questionTemplateId: $questionTemplateId) {
                id
            }
        }
    `

    const [deleteQuestionTemplateApolloFunc, { loading, data, error }] = useMutation(DELETE_QUESTION_TEMPLATE, {
        update(cache, mutationResult) {
            const questionTemplateDeleted = mutationResult.data.deleteQuestionTemplate
            const id = cache.identify({
                __typename: 'QuestionTemplate',
                id: questionTemplateDeleted.id,
            })
            cache.evict({ id })
        },
    })

    const deleteQuestionTemplate = (questionTemplateId: string) => {
        deleteQuestionTemplateApolloFunc({
            variables: { questionTemplateId },
        })
    }

    return {
        deleteQuestionTemplate,
        loading,
        error,
    }
}
