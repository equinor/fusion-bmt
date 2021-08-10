import React from 'react'
import { Box } from '@material-ui/core'

import { Evaluation, Progression } from '../../../../api/models'
import ListView from './ListView'
import BowtieView from './BowtieView'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import { assignAnswerToBarrierQuestions } from './helpers'
import Bowtie from '../../../../components/Bowtie/Bowtie'

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
