import React from 'react'
import styled from 'styled-components'
import { Tooltip } from '@equinor/eds-core-react'

interface EvaluationScoreIndicatorProps {
    date: string;
}

const Circle = styled.div<{ color: string }>`
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background-color: ${(props) => props.color};
`

const EvaluationScoreIndicator: React.FC<EvaluationScoreIndicatorProps> = ({ date }) => {
    const [diffInMonths, setDiffInMonths] = React.useState<number>(0)

    React.useEffect(() => {
        const currentDate = new Date()
        const evaluationDate = new Date(date)
        const diffInMonths = (currentDate.getFullYear() - evaluationDate.getFullYear()) * 12 + (currentDate.getMonth() - evaluationDate.getMonth())
        setDiffInMonths(diffInMonths)
    }, [date])

    const getColor = () => {
        if (diffInMonths < 1) {
            return '#31d325'
        } else if (diffInMonths < 2) {
            return '#ffab1b'
        } else {
            return '#ff1b1b'
        }
    };

    const getTooltipText = () => {
        if (diffInMonths < 1) {
            return 'Evaluation has been updated this past month'
        } else if (diffInMonths < 2) {
            return 'Evaluation has been updated during the past two months'
        } else {
            return 'Evaluation has not been updated in the past 2 months'
        }
    }

    if (!date) {
        return null
    }

    return (
        <Tooltip placement='right' title={getTooltipText()}>
            <Circle color={getColor()} />
        </Tooltip>
    )

};

export default EvaluationScoreIndicator
