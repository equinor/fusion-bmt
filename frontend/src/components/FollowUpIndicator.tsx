import React from 'react'
import { Chip, Tooltip } from '@equinor/eds-core-react'
import styled from 'styled-components'

type FollowUpIndicatorProps = {
    value: number | null
}

const ColoredChip = styled(Chip) <{ chipColor: string, textColor: string }>`
    background-color: ${props => props.chipColor};
    color: ${props => props.textColor};
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

const getColorsForValue = (value: number | null): { chipColor: string, textColor: string } => {
    if (value === null) {
        return { chipColor: '#ccc', textColor: '#ccc' }
    }
    const percentage = value * 100
    if (percentage < 75) {
        return { chipColor: '#FFC1C1', textColor: '#B30D2F' }
    } else if (percentage < 90) {
        return { chipColor: '#FFE7D6', textColor: '#AD6200' }
    } else {
        return { chipColor: '#E6FAEC', textColor: '#007079' }
    }
}

const FollowUpIndicator: React.FC<FollowUpIndicatorProps> = ({ value }) => {
    if (typeof value === 'number') {
        const percentage = toPercentage(value);
        const { chipColor, textColor } = getColorsForValue(value);

        return (
            <Tooltip placement='right' title={`Evaluation contains ${percentage} "on track" / green questions`}>
                <ColoredChip chipColor={chipColor} textColor={textColor}>
                    {percentage}
                </ColoredChip>
            </Tooltip>
        )
    } else {
        return null
    }
}

export default FollowUpIndicator
