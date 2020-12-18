import React from 'react'

import { Icon } from '@equinor/eds-core-react'

import { Priority } from '../../api/models'

const dot = {
    name: 'dot',
    prefix: 'eds',
    height: '24',
    width: '24',
    svgPathData: `m 6 12 a 6 6 0 0 0 12 0 a 6 6 0 0 0 -12 0 z`
}

interface PriorityIndicatorProps
{
    priority: Priority
}

const PriorityIndicator = ({priority}: PriorityIndicatorProps) => {
    const getColor = (priority: Priority) => {
        switch (priority) {
        case Priority.High:
            return 'red'
        case Priority.Medium:
            return 'orange'
        case Priority.Low:
            return 'green'
        }
    }

    return <>
        <Icon
            data={dot}
            color={getColor(priority)}
            size={16}
        />
    </>
}

export default PriorityIndicator
