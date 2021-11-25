import React from 'react'
import styled from 'styled-components'
import { CircularProgress, Icon, Typography } from '@equinor/eds-core-react'
import { check_circle_outlined, block } from '@equinor/eds-icons'
import { tokens } from '@equinor/eds-tokens'
import { SavingState } from '../utils/Variables'

interface SaveIndicatorProps {
    savingState: SavingState
    spinnerColor?: 'primary' | 'neutral'
}

const SaveConfirmation = styled.div<{ 'data-testid'?: string }>`
    display: flex;
    align-items: center;
`

SaveConfirmation.defaultProps = {
    'data-testid': 'save_indicator',
}

const SaveIndicatorOnButton = ({ savingState, spinnerColor = 'neutral' }: SaveIndicatorProps) => {
    const fontColor = tokens.colors.interactive.disabled__text.rgba
    const textStyle = { paddingLeft: '7px', fontSize: 14, fontWeight: 500 }

    return (
        <>
            {savingState === SavingState.Saving && (
                <SaveConfirmation>
                    <CircularProgress
                        color={spinnerColor}
                        style={{
                            width: '20px',
                            height: '20px',
                        }}
                    />
                    <Typography color={fontColor} style={textStyle}>
                        Saving..
                    </Typography>
                </SaveConfirmation>
            )}
            {savingState === SavingState.Saved && (
                <SaveConfirmation>
                    <Icon data={check_circle_outlined} color={fontColor} />
                    <Typography color={fontColor} style={textStyle}>
                        Saved
                    </Typography>
                </SaveConfirmation>
            )}
            {savingState === SavingState.NotSaved && (
                <SaveConfirmation>
                    <Icon data={block} color={fontColor} />
                    <Typography color={fontColor} style={textStyle}>
                        Not Saved
                    </Typography>
                </SaveConfirmation>
            )}
        </>
    )
}

export default SaveIndicatorOnButton
