import React, { RefObject, useRef, useState } from 'react'

import { Box } from '@material-ui/core'
import { Button, Icon, Tooltip, Typography } from '@equinor/eds-core-react'
import { add, more_vertical } from '@equinor/eds-icons'

import { Organization, QuestionTemplate } from '../../../../api/models'
import OrganizationFilter from '../../../../components/OrganizationFilter'
import BarrierMenu from './BarrierMenu'

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
    const menuAnchorRef = useRef<HTMLButtonElement>(null)
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
                        <Button
                            variant="ghost"
                            color="primary"
                            onClick={() => onAddNewQuestionClick()}
                            data-testid="create-new-question-button"
                        >
                            <Icon data={add}></Icon>
                        </Button>
                    </Tooltip>
                </Box>
                <Box mt={2.5}>
                    <Button
                        variant="ghost"
                        color="primary"
                        ref={menuAnchorRef}
                        onClick={() => (isMenuOpen ? setIsMenuOpen(false) : setIsMenuOpen(true))}
                        data-testid="add-to-category-reorder-questions"
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
                setIsInReorderMode={setIsInReorderMode}
                isInReorderMode={isInReorderMode}
            />
        </>
    )
}

export default BarrierHeader
