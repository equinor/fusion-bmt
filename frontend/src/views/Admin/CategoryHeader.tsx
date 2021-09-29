import React, { useState } from 'react'
import { Box } from '@material-ui/core'
import { SearchableDropdown, SearchableDropdownOption } from '@equinor/fusion-components'
import { Button, Icon } from '@equinor/eds-core-react'
import { add } from '@equinor/eds-icons'

import { ProjectCategory } from '../../api/models'
import CreateProjectCategorySidebar from './CreateProjectCategorySidebar'

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

    const projectCategoryOptions: SearchableDropdownOption[] = [
        {
            title: 'All project categories',
            key: 'all',
            isSelected: 'all' === selectedProjectCategory,
        },
    ]

    projectCategories.forEach((projectCategory: ProjectCategory) =>
        projectCategoryOptions.push({
            title: projectCategory.name,
            key: projectCategory.id,
            isSelected: projectCategory.id === selectedProjectCategory,
        })
    )

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
                    onProjectCategoryCreated={onCreated}
                    projectCategories={projectCategories}
                />
            )}
        </>
    )
}

export default CategoryHeader
