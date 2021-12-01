import React, { RefObject, useRef, useState } from 'react'

import { Box } from '@material-ui/core'
import { Button, Icon, Menu, Tooltip, Typography } from '@equinor/eds-core-react'
import { add, add_circle_outlined, close_circle_outlined, more_vertical, swap_vertical } from '@equinor/eds-icons'

import { Organization, QuestionTemplate } from '../../../../api/models'
import OrganizationFilter from '../../../../components/OrganizationFilter'

interface Props {
    headerRef: RefObject<HTMLElement>
    title: string
    barrierQuestions: QuestionTemplate[]
    onAddNewQuestionClick: () => void
    isInAddCategoryMode: boolean
    setIsInAddCategoryMode: (val: boolean) => void
    isInReorderMode: boolean
    setIsInReorderMode: (val: boolean) => void
    organizationFilter: Organization[]
    onOrganizationFilterToggled: (val: Organization) => void
}

const BarrierHeader = ({
    headerRef,
    title,
    barrierQuestions,
    onAddNewQuestionClick,
    isInAddCategoryMode,
    setIsInAddCategoryMode,
    isInReorderMode,
    setIsInReorderMode,
    organizationFilter,
    onOrganizationFilterToggled,
}: Props) => {
    const menuAnchorRef = useRef<HTMLDivElement>(null)
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

    return (
        <>
            <Box display="flex" flexDirection="row">
                <Box flexGrow={1} m={1}>
                    <Typography variant="h3" ref={headerRef} data-testid="barrier-name">
                        {title}
                    </Typography>
                    <OrganizationFilter
                        organizationFilter={organizationFilter}
                        onOrganizationFilterToggled={onOrganizationFilterToggled}
                        questions={barrierQuestions}
                    />
                </Box>
                <Box mt={2.5}>
                    <Tooltip placement="bottom" title={'Add new question'}>
                        <Button variant="ghost" color="primary" onClick={onAddNewQuestionClick} data-testid="create-new-question-button">
                            <Icon data={add}></Icon>
                        </Button>
                    </Tooltip>
                </Box>
                <Box mt={2.5}>
                    <div ref={menuAnchorRef} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Button variant="ghost" color="primary" data-testid="add-to-category-reorder-questions">
                            <Icon data={more_vertical}></Icon>
                        </Button>
                    </div>
                </Box>
            </Box>
            <Menu
                id="menu-complex"
                open={isMenuOpen}
                anchorEl={menuAnchorRef.current}
                onClose={() => setIsMenuOpen(false)}
                placement={'bottom'}
            >
                <Menu.Item
                    onClick={() => {
                        setIsInAddCategoryMode(!isInAddCategoryMode)
                    }}
                >
                    <Icon data={isInAddCategoryMode ? close_circle_outlined : add_circle_outlined} size={16} />
                    <Typography group="navigation" variant="menu_title" as="span" data-testid="add-qt-to-project-cat-or-close-view">
                        {isInAddCategoryMode ? 'Close add to category view' : 'Add questions to project categories'}
                    </Typography>
                </Menu.Item>
                <Menu.Item
                    onClick={() => {
                        setIsInReorderMode(!isInReorderMode)
                    }}
                >
                    <Icon data={isInReorderMode ? close_circle_outlined : swap_vertical} size={16} />
                    <Typography group="navigation" variant="menu_title" as="span" data-testid="reorder-questions">
                        {isInReorderMode ? 'Close reordering view' : 'Reorder questions'}
                    </Typography>
                </Menu.Item>
            </Menu>
        </>
    )
}

export default BarrierHeader
