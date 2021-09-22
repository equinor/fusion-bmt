import React, { RefObject } from 'react'
import { Icon, Menu, Typography } from '@equinor/eds-core-react'
import { add_circle_outlined, close_circle_outlined } from '@equinor/eds-icons'

interface Props {
    isOpen: boolean
    anchorRef: RefObject<HTMLButtonElement>
    closeMenu: () => void
    setIsInAddCategoryMode: (inEditmode: boolean) => void
    isInAddCategoryMode: boolean
}

const BarrierMenu = ({ isOpen, anchorRef, closeMenu, setIsInAddCategoryMode, isInAddCategoryMode }: Props) => {
    return (
        <Menu id="menu-complex" open={isOpen} anchorEl={anchorRef.current} onClose={closeMenu} placement={'bottom'}>
            <Menu.Item
                onClick={() => {
                    setIsInAddCategoryMode(!isInAddCategoryMode)
                }}
            >
                <Icon data={isInAddCategoryMode ? close_circle_outlined : add_circle_outlined} size={16} />
                <Typography group="navigation" variant="menu_title" as="span">
                    {isInAddCategoryMode ? 'Close category view' : 'Add project categories'}
                </Typography>
            </Menu.Item>
        </Menu>
    )
}

export default BarrierMenu
