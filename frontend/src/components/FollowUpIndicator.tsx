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

const FollowUpIndicator: React.FC<FollowUpIndicatorProps> = ({ value }) => {

    const toPercentage = (value: number | null) => {
        if (value === null) {
            return 'N/A'
        }
        if (value < 0 || value > 1) {
            throw new Error('Value must be between 0 and 1.')
        }
        return `${(value * 100).toFixed(0)}%`
    }

    const getColorForValue = (value: number | null) => {
        if (value === null) {
            return '#ccc'
        }
        const percentage = value * 100
        if (percentage < 75) {
            return '#FFC1C1'
        } else if (percentage < 90) {
            return '#FFE7D6'
        } else {
            return '#E6FAEC'
        }
    }

    const getTextColorForValue = (value: number | null) => {
        if (value === null) {
            return '#ccc'
        }
        const percentage = value * 100
        if (percentage < 75) {
            return '#B30D2F'
        } else if (percentage < 90) {
            return '#AD6200'
        } else {
            return '#007079'
        }
    }

    if (typeof value === 'number') {
        const chipColor = getColorForValue(value);
        const textColor = getTextColorForValue(value);
        return (
            <Tooltip placement='right' title={`Evaluation contains ${toPercentage(value)} "on track" / green questions`}>
                <ColoredChip chipColor={chipColor} textColor={textColor}>
                    {toPercentage(value)}
                </ColoredChip>
            </Tooltip>
        )
    } else {
        return null
    }
}

export default FollowUpIndicator
