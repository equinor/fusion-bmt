import React, { useRef, useState } from 'react'
import { Button, Divider, Icon, Typography } from '@equinor/eds-core-react'
import { add, more_vertical } from '@equinor/eds-icons'
import { ApolloError, gql, useQuery } from '@apollo/client'
import { SearchableDropdown, SearchableDropdownOption, TextArea } from '@equinor/fusion-components'
import { Box } from '@material-ui/core'

import BarrierSidebar from './BarrierSidebar'
import { Barrier, Organization, ProjectCategory, QuestionTemplate, Status } from '../../api/models'
import { barrierToString } from '../../utils/EnumToString'
import { apiErrorMessage } from '../../api/error'
import BarrierMenu from './BarrierMenu'
import CreateQuestionItem from './CreateQuestionItem'
import { PROJECT_CATEGORY_FIELDS_FRAGMENT, QUESTIONTEMPLATE_FIELDS_FRAGMENT } from '../../api/fragments'
import OrganizationFilter from '../../components/OrganizationFilter'
import { useFilter } from '../../utils/hooks'
import { hasOrganization } from '../../utils/QuestionAndAnswerUtils'
import AdminQuestionItem from './AdminQuestionItem'
import CreateProjectCategorySidebar from './CreateProjectCategorySidebar'

interface Props {}

const AdminView = ({}: Props) => {
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
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
    const [isInAddCategoryMode, setIsInAddCategoryMode] = useState<boolean>(false)
    const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false)
    const [isInCreateProjectCategoryMode, setIsInCreateProjectCategoryMode] = useState<boolean>(false)

    const headerRef = useRef<HTMLElement>(null)
    const menuAnchorRef = useRef<HTMLButtonElement>(null)
    const questionTitleRef = useRef<HTMLElement>(null)

    const onProjectCategoryCreated = (projectCategory: string, isCopy: boolean) => {
        setIsInCreateProjectCategoryMode(false)
        refetchProjectCategories()
        if (isCopy) {
            refetchQuestionTemplates()
        }
        setSelectedProjectCategory(projectCategory)
    }

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

    const projectCategoryOptions: SearchableDropdownOption[] = [
        {
            title: 'All project categories',
            key: 'all',
            isSelected: 'all' == selectedProjectCategory,
        },
    ]

    projectCategories.forEach((projectCategory: ProjectCategory) =>
        projectCategoryOptions.push({
            title: projectCategory.name,
            key: projectCategory.id,
            isSelected: projectCategory.id == selectedProjectCategory,
        })
    )

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
                <Box flexGrow={1}>
                    <Box ml={4} width={'250px'}>
                        <SearchableDropdown
                            label="Project Category"
                            placeholder="Select Project Category"
                            onSelect={option => setSelectedProjectCategory(option.key)}
                            options={projectCategoryOptions}
                        />
                    </Box>
                </Box>
                <Box alignSelf={'center'} mr={4}>
                    <Button variant="outlined" onClick={() => setIsInCreateProjectCategoryMode(true)}>
                        <Icon data={add}></Icon>
                        Add project category
                    </Button>
                </Box>
                {isInCreateProjectCategoryMode && (
                    <CreateProjectCategorySidebar
                        isOpen={isInCreateProjectCategoryMode}
                        setIsOpen={setIsInCreateProjectCategoryMode}
                        onProjectCategoryCreated={onProjectCategoryCreated}
                        projectCategories={projectCategories}
                    />
                )}
            </Box>
            <Divider />
            <Box display="flex" height={1}>
                <Box>
                    <BarrierSidebar barrier={selectedBarrier} onBarrierSelected={onBarrierSelected} />
                </Box>
                <Box p="20px" width="1">
                    <Box display="flex" flexDirection="row">
                        <Box flexGrow={1} m={1}>
                            <Typography variant="h3" ref={headerRef} data-testid="barrier-name">
                                {barrierToString(selectedBarrier)}
                            </Typography>
                            <OrganizationFilter
                                organizationFilter={organizationFilter}
                                onOrganizationFilterToggled={onOrganizationFilterToggled}
                                questions={barrierQuestions}
                            />
                        </Box>
                        <Box mt={2.5}>
                            <Button variant="ghost" color="primary" onClick={() => setIsAddingQuestion(true)}>
                                <Icon data={add}></Icon>
                            </Button>
                        </Box>
                        <Box mt={2.5}>
                            <Button
                                variant="ghost"
                                color="primary"
                                ref={menuAnchorRef}
                                onClick={() => (isMenuOpen ? setIsMenuOpen(false) : setIsMenuOpen(true))}
                            >
                                <Icon data={more_vertical}></Icon>
                            </Button>
                        </Box>
                    </Box>
                    <BarrierMenu
                        isOpen={isMenuOpen}
                        anchorRef={menuAnchorRef}
                        closeMenu={() => setIsMenuOpen(false)}
                        setIsInAddCategoryMode={setIsInAddCategoryMode}
                        isInAddCategoryMode={isInAddCategoryMode}
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
                    <div>
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
                        {sortedBarrierQuestions.length === 0 && (
                            <Box display="flex" flexDirection={'column'} alignItems={'center'} mt={8}>
                                <Typography style={{ marginBottom: '5px' }}>Nothing here yet.</Typography>
                                <Typography>
                                    Add a new question or select "All project categories" to find questions that can be assigned to your new
                                    category.
                                </Typography>
                            </Box>
                        )}
                    </div>
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
