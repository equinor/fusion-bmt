import React, { useRef, useState } from 'react'
import { Divider, Typography } from '@equinor/eds-core-react'
import { ApolloError, gql, useQuery } from '@apollo/client'
import { TextArea } from '@equinor/fusion-components'
import { Box } from '@material-ui/core'

import { PROJECT_CATEGORY_FIELDS_FRAGMENT, QUESTIONTEMPLATE_FIELDS_FRAGMENT } from '../../api/fragments'
import { Barrier, Organization, ProjectCategory, QuestionTemplate, Status } from '../../api/models'
import { barrierToString } from '../../utils/EnumToString'
import { useFilter } from '../../utils/hooks'
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

    const { filter: organizationFilter, onFilterToggled: onOrganizationFilterToggled } = useFilter<Organization>()
    const [selectedBarrier, setSelectedBarrier] = useState<Barrier>(Barrier.Gm)
    const [selectedProjectCategory, setSelectedProjectCategory] = useState<string>('all')
    const [isInAddCategoryMode, setIsInAddCategoryMode] = useState<boolean>(false)
    const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false)

    const headerRef = useRef<HTMLElement>(null)
    const questionTitleRef = useRef<HTMLElement>(null)

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
                        setIsAddingQuestion={setIsAddingQuestion}
                        isInAddCategoryMode={isInAddCategoryMode}
                        setIsInAddCategoryMode={setIsInAddCategoryMode}
                        organizationFilter={organizationFilter}
                        onOrganizationFilterToggled={onOrganizationFilterToggled}
                    />
                    {isAddingQuestion && (
                        <>
                            <Divider />
                            <CreateQuestionItem
                                setIsAddingQuestion={setIsAddingQuestion}
                                barrier={selectedBarrier}
                                questionTitleRef={questionTitleRef}
                                selectedProjectCategory={selectedProjectCategory}
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
                                        questionTitleRef={questionTitleRef}
                                        refetchQuestionTemplates={refetchQuestionTemplates}
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
