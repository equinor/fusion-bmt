import React, { useEffect } from 'react'
import { CircularProgress, Icon, Typography } from '@equinor/eds-core-react'
import { check_circle_outlined } from '@equinor/eds-icons'
import { SavingState } from '../utils/Variables'
import styled from 'styled-components'
import { tokens } from '@equinor/eds-tokens'

interface SaveIndicatorProps {
    savingState: SavingState
}

const SaveConfirmation = styled.div`
    display: flex;
    align-items: center;
`

const SaveIndicator = ({ savingState }: SaveIndicatorProps) => {
    return (
        <>
            {savingState === SavingState.Saving && (
                <SaveConfirmation>
                    <CircularProgress style={{ width: '25px', height: '25px' }} />
                    <Typography italic style={{ paddingLeft: '10px' }}>
                        Saving...
                    </Typography>
                </SaveConfirmation>
            )}
            {savingState === SavingState.Saved && (
                <SaveConfirmation>
                    <Icon data={check_circle_outlined} color={tokens.colors.interactive.primary__resting.rgba} />
                    <Typography italic style={{ paddingLeft: '10px' }}>
                        Saved
                    </Typography>
                </SaveConfirmation>
            )}
        </>
    )
}

export default SaveIndicator
