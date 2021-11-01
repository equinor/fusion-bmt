import React, { RefObject, useState } from 'react'
import { tokens } from '@equinor/eds-tokens'
import { MarkdownViewer } from '@equinor/fusion-components'
import { Button, Chip, Icon, MultiSelect, Tooltip, Typography } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'
import { arrow_down, arrow_up, platform, work } from '@equinor/eds-icons'

import { ProjectCategory, QuestionTemplate } from '../../api/models'
import { organizationToString } from '../../utils/EnumToString'
import { UseMultipleSelectionStateChange } from 'downshift'
import { ApolloError, gql, useMutation } from '@apollo/client'
import SaveIndicator from '../../components/SaveIndicator'
import { SavingState } from '../../utils/Variables'
import { deriveNewSavingState, getNextNextQuestion, getNextQuestion, getPrevQuestion } from '../helpers'
import { useEffectNotOnMount } from '../../utils/hooks'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import ErrorMessage from './Components/ErrorMessage'
import QuestionTemplateButtons from './Components/QuestionTemplateButtons'
import styled from 'styled-components'

const StyledDiv = styled.div<{ isNew: boolean }>`
    display: flex;
    flex-direction: column;
    -webkit-animation: ${({ isNew }) => (isNew ? 'fadein 1s;' : '')};
    animation: ${({ isNew }) => (isNew ? 'fadein 1s;' : '')};

    @keyframes fadein {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @-webkit-keyframes fadein {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`

interface Props {
    question: QuestionTemplate
    setIsInEditmode: (inEditmode: boolean) => void
    projectCategories: ProjectCategory[]
    isInAddCategoryMode: boolean
    isInReorderMode: boolean
    questionTitleRef: RefObject<HTMLElement>
    refetchQuestionTemplates: () => void
    sortedBarrierQuestions: QuestionTemplate[]
    projectCategoryQuestions: QuestionTemplate[]
    setQuestionTemplateToCopy: (original: QuestionTemplate) => void
    setIsAddingQuestion: (val: boolean) => void
    questionToScrollIntoView: string
}

const StaticQuestionItem = ({
    question,
    setIsInEditmode,
    projectCategories,
    isInAddCategoryMode,
    isInReorderMode,
    questionTitleRef,
    refetchQuestionTemplates,
    sortedBarrierQuestions,
    projectCategoryQuestions,
    setQuestionTemplateToCopy,
    setIsAddingQuestion,
    questionToScrollIntoView,
}: Props) => {
    const [savingState, setSavingState] = useState<SavingState>(SavingState.None)
    const [isInConfirmDeleteMode, setIsInConfirmDeleteMode] = useState<boolean>(false)
    const projectCategoriesOptions = [...projectCategories].map(category => category.name)

    const {
        addToProjectCategory,
        loading: addingToProjectCategory,
        error: addingToProjectCategoryError,
    } = useAddToProjectCategoryMutation()

    const {
        removeFromProjectCategories,
        loading: removingFromProjectCategory,
        error: removingFromProjectCategoryError,
    } = useRemoveFromProjectCategoriesMutation()

    const {
        deleteQuestionTemplate,
        loading: deletingQuestionTemplate,
        error: deletingQuestionTemplateError,
    } = useDeleteQuestionTemplateMutation()

    const {
        reorderQuestionTemplate,
        loading: reorderingQuestionTemplate,
        error: reorderingQuestionTemplateError,
    } = useReorderQuestionTemplateMutation()

    const onReorderUpClick = (prevQuestion: QuestionTemplate | undefined, nextQuestion: QuestionTemplate | undefined) => {
        if (prevQuestion !== undefined) {
            const nextQuestionId = nextQuestion ? nextQuestion.id : ''
            reorderQuestionTemplate(prevQuestion.id, nextQuestionId)
        }
    }

    const onReorderDownClick = (question: QuestionTemplate, nextNextQuestion: QuestionTemplate | undefined) => {
        const nextNextQuestionId = nextNextQuestion ? nextNextQuestion.id : ''
        reorderQuestionTemplate(question.id, nextNextQuestionId)
    }

    useEffectNotOnMount(() => {
        if (!reorderingQuestionTemplate) {
            refetchQuestionTemplates()
        }
    }, [reorderingQuestionTemplate])

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
            refetchQuestionTemplates()
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
            if (selection.length === 0) {
                const ids: string[] = []
                question.projectCategories.forEach(questionProjectCategory => {
                    ids.push(questionProjectCategory.id)
                })
                removeFromProjectCategories({
                    questionTemplateId: question.id,
                    projectCategoryIds: ids,
                })
            } else {
                const addedItemInSelection = checkIfAddedCategory(selection)
                const removedItemInSelection = checkIfRemovedCategory(selection)

                if (addedItemInSelection) {
                    addToProjectCategory({
                        questionTemplateId: question.id,
                        projectCategoryId: addedItemInSelection.id,
                    })
                }

                if (removedItemInSelection) {
                    removeFromProjectCategories({
                        questionTemplateId: question.id,
                        projectCategoryIds: [removedItemInSelection.id],
                    })
                }
            }
        }
    }

    const barrierOrders: number[] = sortedBarrierQuestions.map(q => {
        return q.order
    })
    const lowestBarrierOrder = Math.min(...barrierOrders)
    const highestBarrierOrder = Math.max(...barrierOrders)

    const prevQuestion = getPrevQuestion(projectCategoryQuestions, question)
    const nextQuestion = getNextQuestion(projectCategoryQuestions, question)
    const nextNextQuestion = getNextNextQuestion(projectCategoryQuestions, question)

    return (
        <>
            <StyledDiv isNew={questionToScrollIntoView === question.id}>
                <Box display="flex" flexDirection="row">
                    <Box display="flex" flexGrow={1} mb={3} mr={5}>
                        <Box ml={2} mr={1}>
                            <Typography variant="h4" data-testid={'question-number-' + question.adminOrder}>
                                {question.adminOrder}.
                            </Typography>
                        </Box>
                        <Box>
                            <Typography
                                variant="h4"
                                ref={questionToScrollIntoView === question.id ? questionTitleRef : undefined}
                                data-testid={'question-title-' + question.adminOrder}
                            >
                                {question.text}
                            </Typography>
                            <Box display="flex" flexDirection="row" flexWrap="wrap" mb={2} mt={1} alignItems={'center'}>
                                <Box mr={1} mb={1}>
                                    <Chip
                                        style={{ backgroundColor: tokens.colors.infographic.primary__spruce_wood.rgba }}
                                        data-testid={'organization-' + question.adminOrder}
                                    >
                                        <Tooltip title={'Organization'} placement={'bottom'}>
                                            <Icon data={work} size={16}></Icon>
                                        </Tooltip>
                                        {organizationToString(question.organization)}
                                    </Chip>
                                </Box>
                                {question.projectCategories.map((category, index) => (
                                    <Box
                                        mr={1}
                                        mb={1}
                                        key={index}
                                        data-testid={'project-category-' + question.adminOrder + '-' + category.name}
                                    >
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
                                            data-testid={'project-category-selector-' + question.adminOrder}
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
                        <QuestionTemplateButtons
                            question={question}
                            setIsInEditmode={setIsInEditmode}
                            setQuestionTemplateToCopy={setQuestionTemplateToCopy}
                            setIsAddingQuestion={setIsAddingQuestion}
                            setIsInConfirmDeleteMode={setIsInConfirmDeleteMode}
                        />
                        {isInReorderMode && (
                            <Box>
                                <Button
                                    data-testid={'move-question-up-' + question.adminOrder}
                                    variant="ghost"
                                    color="primary"
                                    disabled={question.order === lowestBarrierOrder || reorderingQuestionTemplate}
                                    onClick={() => onReorderUpClick(prevQuestion, nextQuestion)}
                                >
                                    <Icon data={arrow_up}></Icon>
                                </Button>
                                <Button
                                    data-testid={'move-question-down-' + question.adminOrder}
                                    variant="ghost"
                                    color="primary"
                                    disabled={question.order === highestBarrierOrder || reorderingQuestionTemplate}
                                    onClick={() => onReorderDownClick(question, nextNextQuestion)}
                                >
                                    <Icon data={arrow_down}></Icon>
                                </Button>
                            </Box>
                        )}
                        <Box alignSelf={'flex-end'} mr={2}>
                            <SaveIndicator savingState={savingState} />
                        </Box>
                    </Box>
                    <ConfirmationDialog
                        isOpen={isInConfirmDeleteMode}
                        title={'Delete question template'}
                        description={'Are you sure you want to delete the question: ' + "'" + question.text + "'"}
                        onConfirmClick={() => deleteQuestionTemplate(question.id)}
                        onCancelClick={() => setIsInConfirmDeleteMode(false)}
                    />
                </Box>
                {deletingQuestionTemplateError !== undefined && <ErrorMessage text={'Could not delete question template'} />}
            </StyledDiv>
            {addingToProjectCategoryError && <ErrorMessage text={'Not able to add project category to question template'} />}
            {removingFromProjectCategoryError && <ErrorMessage text={'Not able to remove project category from question template'} />}
            {reorderingQuestionTemplateError && <ErrorMessage text={'Not able to reorder question templates'} />}
        </>
    )
}

export default StaticQuestionItem

export interface DataToAddToProjectCategory {
    questionTemplateId: string
    projectCategoryId: string
}

interface AddToProjectCategoryMutationProps {
    addToProjectCategory: (data: DataToAddToProjectCategory) => void
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

    const addToProjectCategory = (data: DataToAddToProjectCategory) => {
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

export interface DataToRemoveFromProjectCategories {
    questionTemplateId: string
    projectCategoryIds: string[]
}

interface RemoveFromProjectCategoriesMutationProps {
    removeFromProjectCategories: (data: DataToRemoveFromProjectCategories) => void
    loading: boolean
    error: ApolloError | undefined
}

const useRemoveFromProjectCategoriesMutation = (): RemoveFromProjectCategoriesMutationProps => {
    const REMOVE_FROM_PROJECT_CATEGORIES = gql`
        mutation RemoveFromProjectCategories($questionTemplateId: String!, $projectCategoryIds: [String]!) {
            removeFromProjectCategories(questionTemplateId: $questionTemplateId, projectCategoryIds: $projectCategoryIds) {
                id
                projectCategories {
                    id
                    name
                }
            }
        }
    `

    const [removeFromProjectCategoriesApolloFunc, { loading, data, error }] = useMutation(REMOVE_FROM_PROJECT_CATEGORIES)

    const removeFromProjectCategories = (data: DataToRemoveFromProjectCategories) => {
        removeFromProjectCategoriesApolloFunc({
            variables: { ...data },
        })
    }

    return {
        removeFromProjectCategories,
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

    const [deleteQuestionTemplateApolloFunc, { loading, data, error }] = useMutation(DELETE_QUESTION_TEMPLATE)

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

interface ReorderQuestionTemplateMutationProps {
    reorderQuestionTemplate: (questionTemplateId: string, newNextQuestionTemplateId: string | undefined) => void
    loading: boolean
    error: ApolloError | undefined
}

const useReorderQuestionTemplateMutation = (): ReorderQuestionTemplateMutationProps => {
    const REORDER_QUESTION_TEMPLATE = gql`
        mutation ReorderQuestionTemplate($questionTemplateId: String!, $newNextQuestionTemplateId: String!) {
            reorderQuestionTemplate(questionTemplateId: $questionTemplateId, newNextQuestionTemplateId: $newNextQuestionTemplateId) {
                id
            }
        }
    `

    const [reorderQuestionTemplateApolloFunc, { loading, data, error }] = useMutation(REORDER_QUESTION_TEMPLATE)

    const reorderQuestionTemplate = (questionTemplateId: string, newNextQuestionTemplateId: string | undefined) => {
        reorderQuestionTemplateApolloFunc({
            variables: { questionTemplateId, newNextQuestionTemplateId },
        })
    }

    return {
        reorderQuestionTemplate,
        loading,
        error,
    }
}
