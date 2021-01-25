import React from 'react'
import { CheckCircleIcon, ScheduleIcon } from '@equinor/fusion-components'
import { calcProgressionStatus, ProgressionStatus } from '../utils/ProgressionStatus'
import { Progression } from '../api/models'

interface ProgressStatusIconProps {
    progression: Progression
    compareProgression: Progression
}

const ProgressStatusIcon = ({ progression, compareProgression }: ProgressStatusIconProps) => {
    const status = calcProgressionStatus(progression, compareProgression)
    switch (status) {
        case ProgressionStatus.InProgress: {
            return <ScheduleIcon color="orange" height={24} width={24} />
        }
        case ProgressionStatus.Complete: {
            return <CheckCircleIcon color="green" height={24} width={24} />
        }
        case ProgressionStatus.Awaiting: {
            return <CheckCircleIcon color="gray" height={24} width={24} />
        }
    }
}

export default ProgressStatusIcon
