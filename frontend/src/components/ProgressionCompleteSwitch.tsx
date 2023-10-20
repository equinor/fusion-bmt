import { Switch } from '@equinor/eds-core-react'
import React, { useState } from 'react'

interface Props {
    isCheckedInitially: boolean
    disabled: boolean
    onCompleteClick: () => void
    onUncompleteClick: () => void
}

const ProgressionCompleteSwitch = ({ isCheckedInitially, disabled, onCompleteClick, onUncompleteClick }: Props) => {
    const [isChecked, setIsChecked] = useState<boolean>(isCheckedInitially)

    const onLocalClick = () => {
        if (!isChecked) {
            setIsChecked(true)
            onCompleteClick()
        } else {
            setIsChecked(false)
            onUncompleteClick()
        }
    }

    return (
        <>
            <Switch
                data-testid="complete-switch"
                checked={isChecked}
                onChange={() => {}} // This is required to avoid an error
                onClick={onLocalClick}
                disabled={disabled}
                label="Complete"
                crossOrigin={null}
            />
        </>
    )
}

export default ProgressionCompleteSwitch
