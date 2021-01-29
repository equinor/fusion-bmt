import React from 'react'

import { Icon, TextFieldProps } from '@equinor/eds-core-react'
import { error_filled } from '@equinor/eds-icons'

import { Participant } from '../../api/models'

export type TextFieldChangeEvent = React.ChangeEvent<HTMLTextAreaElement> & React.ChangeEvent<HTMLInputElement>

export type Validity = Exclude<TextFieldProps['variant'], undefined | 'warning'>

export const ErrorIcon = <Icon size={16} data={error_filled} color="danger" />

export const checkIfTitleValid = (title: string) => {
    return title.length > 0
}

export const checkIfParticipantValid = (participant: Participant | undefined) => {
    return participant !== undefined
}
