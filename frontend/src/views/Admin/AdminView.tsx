import React, { useRef, useState } from 'react'
import { Divider, Typography } from '@equinor/eds-core-react'
import { ApolloError, gql, useMutation, useQuery } from '@apollo/client'
import { TextArea } from '@equinor/fusion-components'
import { Box } from '@material-ui/core'

import { PROJECT_CATEGORY_FIELDS_FRAGMENT, QUESTIONTEMPLATE_FIELDS_FRAGMENT } from '../../api/fragments'
import { Barrier, Organization, ProjectCategory, QuestionTemplate, Status } from '../../api/models'
import { barrierToString } from '../../utils/EnumToString'
import { useEffectNotOnMount, useFilter } from '../../utils/hooks'
import { hasOrganization } from '../../utils/QuestionAndAnswerUtils'
import { apiErrorMessage } from '../../api/error'

import CreateQuestionItem from './CreateQuestionItem'
import AdminQuestionItem from './AdminQuestionItem'
import BarrierHeader from './BarrierHeader'
import CategoryHeader from './CategoryHeader'
import BarrierSidebar from './BarrierSidebar'

const AdminView = () => {
    const {
        loading: isFetchingProjectCategories,
        projectCategories,
        error: errorProjectCategoryQuery,
        refetch: refetchProjectCategories,
    } = useProjectCategoriesQuery()
    const { questions, loading, error, refetch: refetchQuestionTemplates } = useQuestionTemplatesQuery()
    const {
        createQuestionTemplate,
        createdQuestionTemplate,
        loading: isCreateQuestionTemplateSaving,
        error: createQuestionTemplateSaveError,
    } = useCreateQuestionTemplateMutation()

    const { filter: organizationFilter, onFilterToggled: onOrganizationFilterToggled } = useFilter<Organization>()
    const [prevQuestionsCount, setPrevQuestionsCount] = useState(questions ? questions.length : 0)
    const [selectedBarrier, setSelectedBarrier] = useState<Barrier>(Barrier.Gm)
    const [selectedProjectCategory, setSelectedProjectCategory] = useState<string>('all')
    const [isInAddCategoryMode, setIsInAddCategoryMode] = useState<boolean>(false)
    const [isInReorderMode, setIsInReorderMode] = useState<boolean>(false)
    const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false)
    const [questionTemplateToCopy, setQuestionTemplateToCopy] = useState<QuestionTemplate | undefined>()

    const headerRef = useRef<HTMLElement>(null)
    const questionTitleRef = useRef<HTMLElement>(null)

    useEffectNotOnMount(() => {
        if (!isCreateQuestionTemplateSaving && createQuestionTemplateSaveError === undefined) {
            setIsAddingQuestion(false)
        }
    }, [isCreateQuestionTemplateSaving])

    useEffectNotOnMount(() => {
        if (questions) {
            if (questions.length > prevQuestionsCount && questionTitleRef !== null && questionTitleRef.current) {
                questionTitleRef.current.scrollIntoView()
                setQuestionTemplateToCopy(undefined)
            }

            setPrevQuestionsCount(questions.length)
        }
    }, [questions])

    if (isFetchingProjectCategories) {
        return <>Loading...</>
    }

    if (errorProjectCategoryQuery !== undefined || projectCategories === undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not load Project Categories')} onChange={() => {}} />
            </div>
        )
    }

    if (loading) {
        return <>Loading...</>
    }

    if (error !== undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not load questions')} onChange={() => {}} />
            </div>
        )
    }

    if (questions === undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Questions are undefined')} onChange={() => {}} />
            </div>
        )
    }

    const onBarrierSelected = (barrier: Barrier) => {
        setSelectedBarrier(barrier)

        if (headerRef !== null && headerRef.current) {
            headerRef.current.scrollIntoView()
        }
    }

    const onAddNewQuestionClick = () => {
        setQuestionTemplateToCopy(undefined)
        setIsAddingQuestion(true)
    }

    const projectCategoryQuestions = questions.filter(
        q =>
            q.projectCategories
                .map(pc => {
                    return pc.id
                })
                .includes(selectedProjectCategory) || selectedProjectCategory === 'all'
    )
    const barrierQuestions = projectCategoryQuestions.filter(q => q.barrier === selectedBarrier)
    const organizationFilteredQuestions =
        organizationFilter !== undefined ? barrierQuestions.filter(q => hasOrganization(q, organizationFilter)) : barrierQuestions
    const sortedBarrierQuestions = organizationFilteredQuestions.sort((q1, q2) => q1.order - q2.order)

    return (
        <>
            <Box m={2}>
                <Typography variant="h2" data-testid="admin-page-title">
                    Project configuration: Questionnaire
                </Typography>
            </Box>
            <Divider />
            <Box display={'flex'} flexDirection={'row'}>
                <CategoryHeader
                    selectedProjectCategory={selectedProjectCategory}
                    setSelectedProjectCategory={setSelectedProjectCategory}
                    projectCategories={projectCategories}
                    refetchProjectCategories={refetchProjectCategories}
                    refetchQuestionTemplates={refetchQuestionTemplates}
                />
            </Box>
            <Divider />
            <Box display="flex" height={1}>
                <Box>
                    <BarrierSidebar barrier={selectedBarrier} onBarrierSelected={onBarrierSelected} />
                </Box>
                <Box p="20px" width="1">
                    <BarrierHeader
                        headerRef={headerRef}
                        title={barrierToString(selectedBarrier)}
                        barrierQuestions={barrierQuestions}
                        onAddNewQuestionClick={onAddNewQuestionClick}
                        isInAddCategoryMode={isInAddCategoryMode}
                        setIsInAddCategoryMode={setIsInAddCategoryMode}
                        isInReorderMode={isInReorderMode}
                        setIsInReorderMode={setIsInReorderMode}
                        organizationFilter={organizationFilter}
                        onOrganizationFilterToggled={onOrganizationFilterToggled}
                    />
                    {isAddingQuestion && (
                        <>
                            <Divider />
                            <CreateQuestionItem
                                setIsInAddMode={setIsAddingQuestion}
                                barrier={selectedBarrier}
                                createQuestionTemplate={createQuestionTemplate}
                                isSaving={isCreateQuestionTemplateSaving}
                                saveError={createQuestionTemplateSaveError}
                                selectedProjectCategory={selectedProjectCategory}
                                questionTemplateToCopy={questionTemplateToCopy}
                            />
                        </>
                    )}
                    <>
                        {sortedBarrierQuestions.length > 0 &&
                            sortedBarrierQuestions.map(q => {
                                return (
                                    <AdminQuestionItem
                                        key={q.id}
                                        question={q}
                                        projectCategories={projectCategories}
                                        isInAddCategoryMode={isInAddCategoryMode}
                                        isInReorderMode={isInReorderMode}
                                        questionTitleRef={questionTitleRef}
                                        refetchQuestionTemplates={refetchQuestionTemplates}
                                        sortedBarrierQuestions={sortedBarrierQuestions}
                                        projectCategoryQuestions={projectCategoryQuestions}
                                        setQuestionTemplateToCopy={setQuestionTemplateToCopy}
                                        setIsAddingQuestion={setIsAddingQuestion}
                                        questionToScrollIntoView={
                                            questionTemplateToCopy
                                                ? questionTemplateToCopy.id
                                                : createdQuestionTemplate && createdQuestionTemplate.id
                                        }
                                    />
                                )
                            })}
                        {projectCategoryQuestions.length === 0 && (
                            <Box display="flex" flexDirection={'column'} alignItems={'center'} mt={8}>
                                <Typography style={{ marginBottom: '5px' }}>Nothing here yet.</Typography>
                                <Typography>
                                    Add a new question or select "All project categories" to find questions that can be assigned to your new
                                    category.
                                </Typography>
                            </Box>
                        )}
                    </>
                </Box>
            </Box>
        </>
    )
}

export default AdminView

interface ProjectCategoriesQueryProps {
    loading: boolean
    projectCategories: ProjectCategory[] | undefined
    error: ApolloError | undefined
    refetch: () => void
}

const useProjectCategoriesQuery = (): ProjectCategoriesQueryProps => {
    const GET_PROJECT_CATEGORIES = gql`
        query {
            projectCategory {
                id
                name
            }
        }
    `
    const { loading, data, error, refetch } = useQuery<{ projectCategory: ProjectCategory[] }>(GET_PROJECT_CATEGORIES)

    return {
        loading,
        projectCategories: data?.projectCategory,
        error,
        refetch,
    }
}

interface QuestionTemplatesQueryProps {
    loading: boolean
    questions: QuestionTemplate[] | undefined
    error: ApolloError | undefined
    refetch: () => void
}

const useQuestionTemplatesQuery = (): QuestionTemplatesQueryProps => {
    const GET_QUESTIONTEMPLATES = gql`
        query {
            questionTemplates (where: {status: {eq: ${Status.Active}} }) {
                ...QuestionTemplateFields
                ...ProjectCategoryFields
            }
        }
        ${QUESTIONTEMPLATE_FIELDS_FRAGMENT}
        ${PROJECT_CATEGORY_FIELDS_FRAGMENT}
    `

    const { loading, data, error, refetch } = useQuery<{ questionTemplates: QuestionTemplate[] }>(GET_QUESTIONTEMPLATES)

    return {
        loading,
        questions: data?.questionTemplates,
        error,
        refetch,
    }
}

export interface DataToCreateQuestionTemplate {
    barrier: Barrier
    organization: Organization
    text: string
    supportNotes: string
    projectCategoryIds: string[]
    newOrder: number
}

interface createQuestionTemplateMutationProps {
    createQuestionTemplate: (data: DataToCreateQuestionTemplate) => void
    createdQuestionTemplate: QuestionTemplate
    loading: boolean
    error: ApolloError | undefined
}

const useCreateQuestionTemplateMutation = (): createQuestionTemplateMutationProps => {
    const CREATE_QUESTION_TEMPLATE = gql`
        mutation CreateQuestionTemplate(
            $barrier: Barrier!
            $organization: Organization!
            $text: String!
            $supportNotes: String!
            $projectCategoryIds: [String]
            $newOrder: Int!
        ) {
            createQuestionTemplate(
                barrier: $barrier
                organization: $organization
                text: $text
                supportNotes: $supportNotes
                projectCategoryIds: $projectCategoryIds
                newOrder: $newOrder
            ) {
                ...QuestionTemplateFields
            }
        }
        ${QUESTIONTEMPLATE_FIELDS_FRAGMENT}
    `

    const [createQuestionTemplateApolloFunc, { loading, data, error }] = useMutation(CREATE_QUESTION_TEMPLATE, {
        update(cache, { data: { createQuestionTemplate } }) {
            cache.modify({
                fields: {
                    questionTemplates(existingQuestionTemplates = []) {
                        const newQuestionTemplateRef = cache.writeFragment({
                            id: 'QuestionTemplate:' + createQuestionTemplate.id,
                            data: createQuestionTemplate,
                            fragment: QUESTIONTEMPLATE_FIELDS_FRAGMENT,
                        })
                        return [...existingQuestionTemplates, newQuestionTemplateRef]
                    },
                },
            })
        },
    })

    const createQuestionTemplate = (data: DataToCreateQuestionTemplate) => {
        createQuestionTemplateApolloFunc({
            variables: { ...data },
        })
    }

    return {
        createQuestionTemplate,
        createdQuestionTemplate: data?.createQuestionTemplate,
        loading,
        error,
    }
}
