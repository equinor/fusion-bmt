import React, { RefObject } from 'react'
import { Icon, Menu, Typography } from '@equinor/eds-core-react'
import { add_circle_outlined, close_circle_outlined, swap_vertical } from '@equinor/eds-icons'

interface Props {
    isOpen: boolean
    anchorRef: RefObject<HTMLButtonElement>
    closeMenu: () => void
    setIsInAddCategoryMode: (inEditmode: boolean) => void
    isInAddCategoryMode: boolean
    setIsInReorderMode: (inReordermode: boolean) => void
    isInReorderMode: boolean
}

const BarrierMenu = ({
    isOpen,
    anchorRef,
    closeMenu,
    setIsInAddCategoryMode,
    isInAddCategoryMode,
    setIsInReorderMode,
    isInReorderMode,
}: Props) => {
    return (
        <Menu id="menu-complex" open={isOpen} anchorEl={anchorRef.current} onClose={closeMenu} placement={'bottom'}>
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
    )
}

export default BarrierMenu
