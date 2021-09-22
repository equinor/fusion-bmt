import React, { RefObject } from 'react'
import { Icon, Menu, Typography } from '@equinor/eds-core-react'
import { arrow_up, arrow_down, delete_to_trash } from '@equinor/eds-icons'

interface Props {
    isOpen: boolean
    anchorRef: RefObject<HTMLButtonElement>
    closeMenu: () => void
}

const QuestionTemplateMenu = ({ isOpen, anchorRef, closeMenu }: Props) => {
    return (
        <Menu id="menu-complex" open={isOpen} anchorEl={anchorRef.current} onClose={closeMenu} placement={'bottom'}>
            <Menu.Item onClick={() => {}}>
                <Icon data={arrow_up} size={16} />
                <Typography group="navigation" variant="menu_title" as="span">
                    Move up
                </Typography>
            </Menu.Item>
            <Menu.Item onClick={() => {}}>
                <Icon data={arrow_down} size={16} />
                <Typography group="navigation" variant="menu_title" as="span">
                    Move down
                </Typography>
            </Menu.Item>
            <Menu.Item onClick={() => {}}>
                <Icon data={delete_to_trash} size={16} />
                <Typography group="navigation" variant="menu_title" as="span">
                    Delete
                </Typography>
            </Menu.Item>
        </Menu>
    )
}

export default QuestionTemplateMenu
