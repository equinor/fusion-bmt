import { useRef, useState } from 'react'
import { Button, Divider, Icon, Typography } from '@equinor/eds-core-react'
import { add, more_vertical } from '@equinor/eds-icons'
import { ApolloError, gql, useQuery } from '@apollo/client'
import { SearchableDropdown, SearchableDropdownOption, TextArea } from '@equinor/fusion-components'
import { Box } from '@material-ui/core'

import BarrierSidebar from './BarrierSidebar'
import { Barrier, ProjectCategory } from '../../api/models'
import QuestionListWithApi from './QuestionListWithApi'
import { barrierToString } from '../../utils/EnumToString'
import { apiErrorMessage } from '../../api/error'
import BarrierMenu from './BarrierMenu'
import CreateQuestionItem from './CreateQuestionItem'

interface Props {}

const AdminView = ({}: Props) => {
    const [selectedBarrier, setSelectedBarrier] = useState<Barrier>(Barrier.Gm)
    const [selectedProjectCategory, setSelectedProjectCategory] = useState<string>('all')
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
    const [isInAddCategoryMode, setIsInAddCategoryMode] = useState<boolean>(false)
    const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false)
    const headerRef = useRef<HTMLElement>(null)
    const menuAnchorRef = useRef<HTMLButtonElement>(null)
    const quesstionTitleRef = useRef<HTMLElement>(null)

    const openMenu = () => {
        setIsMenuOpen(true)
    }
    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    const { loading: loadingProjectCategoryQuery, projectCategories, error: errorProjectCategoryQuery } = useGetAllProjectCategoriesQuery()

    const createNewQuestion = () => {
        setIsAddingQuestion(true)
    }

    if (loadingProjectCategoryQuery) {
        return <>Loading...</>
    }

    if (errorProjectCategoryQuery !== undefined || projectCategories === undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not load Project Categories')} onChange={() => {}} />
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

    return (
        <>
            <Box m={2}>
                <Typography variant="h2">Project configuration: Questionnaire</Typography>
            </Box>
            <Divider />
            <Box m={2} width={'250px'}>
                <SearchableDropdown
                    label="Project Category"
                    placeholder="Select Project Category"
                    onSelect={option => setSelectedProjectCategory(option.key)}
                    options={projectCategoryOptions}
                />
            </Box>
            <Divider />
            <Box display="flex" height={1}>
                <Box>
                    <BarrierSidebar barrier={selectedBarrier} onBarrierSelected={onBarrierSelected} />
                </Box>
                <Box p="20px" width="1">
                    <Box display="flex" flexDirection="row">
                        <Box flexGrow={1} m={1}>
                            <Typography variant="h3" ref={headerRef}>
                                {barrierToString(selectedBarrier)}
                            </Typography>
                        </Box>
                        <Box mt={2.5}>
                            <Button variant="ghost" color="primary" onClick={() => createNewQuestion()}>
                                <Icon data={add}></Icon>
                            </Button>
                        </Box>
                        <Box mt={2.5}>
                            <Button
                                variant="ghost"
                                color="primary"
                                ref={menuAnchorRef}
                                onClick={() => (isMenuOpen ? closeMenu() : openMenu())}
                            >
                                <Icon data={more_vertical}></Icon>
                            </Button>
                        </Box>
                    </Box>
                    <BarrierMenu
                        isOpen={isMenuOpen}
                        anchorRef={menuAnchorRef}
                        closeMenu={closeMenu}
                        setIsInAddCategoryMode={setIsInAddCategoryMode}
                        isInAddCategoryMode={isInAddCategoryMode}
                    />
                    {isAddingQuestion && (
                        <>
                            <Divider />
                            <CreateQuestionItem 
                                setIsAddingQuestion={setIsAddingQuestion}
                                barrier={selectedBarrier}
                                questionTitleRef={quesstionTitleRef}
                            />
                        </>
                    )}
                    <QuestionListWithApi
                        barrier={selectedBarrier}
                        projectCategory={selectedProjectCategory}
                        projectCategories={projectCategories}
                        isInAddCategoryMode={isInAddCategoryMode}
                        setIsInAddCategoryMode={setIsInAddCategoryMode}
                        questionTitleRef={quesstionTitleRef}
                    />
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
