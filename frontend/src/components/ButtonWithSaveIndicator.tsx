import { Button } from '@equinor/eds-core-react'
import SaveIndicatorOnButton from './SaveIndicatorOnButton'
import { SavingState } from '../utils/Variables'
import React from 'react'

interface Props {
    isLoading: boolean | undefined
    onClick: () => void
    disabled: boolean | undefined
    children?: React.ReactNode
    testId?: string
    variant?: 'contained' | 'outlined' | 'ghost' | 'ghost_icon'
}

const ButtonWithSaveIndicator = ({ isLoading, onClick, disabled, children, testId, variant = 'contained' }: Props) => {
    return (
        <>
            {isLoading ? (
                <Button disabled data-testid={testId} variant={variant}>
                    <SaveIndicatorOnButton
                        savingState={SavingState.Saving}
                        spinnerColor={variant !== 'contained' ? 'primary' : 'neutral'}
                    />
                </Button>
            ) : (
                <Button onClick={onClick} disabled={disabled} data-testid={testId} variant={variant}>
                    {children}
                </Button>
            )}
        </>
    )
}

export default ButtonWithSaveIndicator
