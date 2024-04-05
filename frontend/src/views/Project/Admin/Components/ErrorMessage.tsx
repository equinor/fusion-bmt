import React from 'react'

import { Box } from '@mui/material'
import { tokens } from '@equinor/eds-tokens'
import { Icon, Typography } from '@equinor/eds-core-react'
import { close } from '@equinor/eds-icons'

import { apiErrorMessage } from '../../../../api/error'

interface Props {
    text: string
    onClose?: () => void
}

const ErrorMessage = ({ text, onClose }: Props) => {
    return (
        <Box
            display={'flex'}
            flexDirection={'row'}
            style={{
                backgroundColor: tokens.colors.ui.background__light.rgba,
                padding: '10px',
            }}
        >
            <Box flexGrow={1}>
                <Typography>{apiErrorMessage(text)}</Typography>
            </Box>
            {onClose && (
                <Box alignSelf={'center'}>
                    <Icon data={close} size={16} cursor={'pointer'} onClick={onClose}></Icon>
                </Box>
            )}
        </Box>
    )
}

export default ErrorMessage
