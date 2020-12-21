import { Switch } from '@equinor/eds-core-react'
import React, { useState } from 'react'

interface Props {
    isCheckedInitially: boolean
    disabled: boolean
    onCompleteClick: () => void
    onUnCompleteClick: () => void
}

const ProgressionCompleteSwitch = ({isCheckedInitially, disabled, onCompleteClick, onUnCompleteClick}: Props) => {
    const [isChecked, setIsChecked] = useState<boolean>(isCheckedInitially)

    const onLocalClick = () => {
        if(!isChecked){
            setIsChecked(true)
            onCompleteClick()
        }
        else{
            setIsChecked(false)
            onUnCompleteClick()
        }
    }

    return <>
        <Switch
            checked={isChecked}
            onChange={() => {}} // This is required to avoid an error
            onClick={onLocalClick}
            disabled={disabled}
            label="Complete"
            enterKeyHint=""
        />
    </>
}


export default ProgressionCompleteSwitch
