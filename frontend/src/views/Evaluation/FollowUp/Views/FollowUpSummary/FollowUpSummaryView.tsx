import React from 'react'
import { Box } from '@mui/material'

import { Evaluation, Progression } from '../../../../../api/models'
import ListView from '../../components/ListView'
import BowtieView from '../../components/BowtieView'
import { AnswersWithBarrier } from '../../../../../utils/Variables'
import { assignAnswerToBarrierQuestions } from '../../util/helpers'

interface Props {
    evaluation: Evaluation
}

const FollowUpSummaryView = ({ evaluation }: Props) => {
    const answersWithBarrier: AnswersWithBarrier[] = assignAnswerToBarrierQuestions(evaluation.questions, Progression.FollowUp)

    return (
        <Box display="flex" flexDirection="column" height={1}>
            <BowtieView answersWithBarrier={answersWithBarrier} />
            <ListView answersWithBarrier={answersWithBarrier} />
        </Box>
    )
}

export default FollowUpSummaryView
