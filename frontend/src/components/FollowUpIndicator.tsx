import React from 'react'
import { Chip, Tooltip } from '@equinor/eds-core-react'
import styled from 'styled-components'

type FollowUpIndicatorProps = {
    value: number | null
}

const ColoredChip = styled(Chip)<{ $chipcolor: string; $textcolor: string }>`
    background-color: ${props => props.$chipcolor};
    color: ${props => props.$textcolor};
`

const toPercentage = (value: number | null): string => {
    if (value === null) {
        return 'N/A'
    }
    if (value < 0 || value > 1) {
        throw new Error('Value must be between 0 and 1.')
    }
    return `${(value * 100).toFixed(0)}%`
}

const getColorsForValue = (value: number | null): { chipcolor: string; textcolor: string } => {
    if (value === null) {
        return { chipcolor: '#ccc', textcolor: '#ccc' }
    }
    const percentage = value * 100
    if (percentage < 60) {
        return { chipcolor: '#FFC1C1', textcolor: '#B30D2F' }
    } else if (percentage < 80) {
        return { chipcolor: '#FFE7D6', textcolor: '#AD6200' }
    } else {
        return { chipcolor: '#E6FAEC', textcolor: '#007079' }
    }
}

const FollowUpIndicator: React.FC<FollowUpIndicatorProps> = ({ value }) => {
    if (typeof value === 'number') {
        const percentage = toPercentage(value)
        const { chipcolor, textcolor } = getColorsForValue(value)

        return (
            <Tooltip placement="right" title={`Evaluation contains ${percentage} "on track" / green questions`}>
                <ColoredChip $chipcolor={chipcolor} $textcolor={textcolor}>
                    {percentage}
                </ColoredChip>
            </Tooltip>
        )
    } else {
        return null
    }
}

export default FollowUpIndicator
