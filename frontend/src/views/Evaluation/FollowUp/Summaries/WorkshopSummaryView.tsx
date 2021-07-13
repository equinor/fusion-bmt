import React from 'react'
import { Box } from '@material-ui/core'

import { Evaluation, Progression } from '../../../../api/models'
import ListView from './ListView'
import BowtieView from './BowtieView'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import { assignAnswerToBarrierQuestions } from './helpers'

interface Props {
    evaluation: Evaluation
}

const WorkshopSummaryView = ({ evaluation }: Props) => {
    const answersWithBarrier: AnswersWithBarrier[] = assignAnswerToBarrierQuestions(evaluation.questions, Progression.Workshop)

    return (
        <Box display="flex" flexDirection="column" height={1}>
            <BowtieView answersWithBarrier={answersWithBarrier} workshopCompleted={evaluation.workshopCompleteDate} />
            <ListView answersWithBarrier={answersWithBarrier} />
        </Box>
    )
}

export default WorkshopSummaryView
