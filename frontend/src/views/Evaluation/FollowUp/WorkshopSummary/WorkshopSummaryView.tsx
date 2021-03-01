import React, { useState } from 'react'

import { Box } from '@material-ui/core'

import { Barrier, Evaluation, Progression } from '../../../../api/models'
import ListView from './ListView'
import BowtieView from './BowtieView'
import { AnswersWithBarrier } from '../../../../utils/Variables'
import WorkshopSummaryNavigation, { ViewOption } from './WorkshopSummaryNavigation'

interface Props {
    evaluation: Evaluation
}

const WorkshopSummaryView = ({ evaluation }: Props) => {
    const [selected, setSelected] = useState<ViewOption>('bowtie')

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
        <Box display="flex" height={1}>
            <WorkshopSummaryNavigation selectedViewOption={selected} onViewOptionSelected={setSelected} />
            {selected === 'list' && <ListView answersWithBarrier={followUpAnswersWithBarrier} />}
            {selected === 'bowtie' && <BowtieView answersWithBarrier={followUpAnswersWithBarrier} />}
        </Box>
    )
}

export default WorkshopSummaryView
