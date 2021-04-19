import React from 'react'

import { Box } from '@material-ui/core'

import { Barrier, Evaluation, Progression } from '../../../../api/models'
import ListView from './ListView'
import BowtieView from './BowtieView'
import { AnswersWithBarrier } from '../../../../utils/Variables'

interface Props {
    evaluation: Evaluation
}

const WorkshopSummaryView = ({ evaluation }: Props) => {
    const followUpAnswersWithBarrier: AnswersWithBarrier[] = Object.values(Barrier).map(barrier => {
        const followUpAnswers = evaluation.questions
            .filter(q => q.barrier === barrier)
            .map(q => {
                const answers = q.answers.filter(a => a.progression === Progression.Workshop)
                const length = answers.length
                if (length === 0) {
                    return null
                }
                return answers[0]
            })
        return { barrier: barrier, answers: followUpAnswers }
    })

    return (
        <Box display="flex" flexDirection="column" height={1}>
            <BowtieView answersWithBarrier={followUpAnswersWithBarrier} />
            <ListView answersWithBarrier={followUpAnswersWithBarrier} />
        </Box>
    )
}

export default WorkshopSummaryView
