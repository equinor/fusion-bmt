import React from 'react'
import { CheckCircleIcon, ScheduleIcon } from '@equinor/fusion-components'
import { calcProgressionStatus, ProgressionStatus } from '../../../../utils/ProgressionStatus'
import { Progression } from '../../../../api/models'
import { Icon } from '@equinor/eds-core-react'
import { check_circle_outlined, time, do_not_disturb } from '@equinor/eds-icons'

interface ProgressStatusIconProps {
    progression: Progression
    compareProgression: Progression
}

const ProgressStatusIcon = ({ progression, compareProgression }: ProgressStatusIconProps) => {
    const status = calcProgressionStatus(progression, compareProgression)
    switch (status) {
        case ProgressionStatus.InProgress: {
            return <Icon color="orange" size={24} data={time} />
        }
        case ProgressionStatus.Complete: {
            return <Icon color="green" size={24} data={check_circle_outlined}  />
        }
        case ProgressionStatus.Awaiting: {
            return <Icon color="gray" size={24} data={do_not_disturb} />
        }
    }
}

export default ProgressStatusIcon
