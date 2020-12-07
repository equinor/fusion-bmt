import * as React from 'react'
import { Barrier, Question, Progression } from '../../api/models'
import { NavigationStructure, Chip, NavigationDrawer } from '@equinor/fusion-components'
import { getAzureUniqueId } from '../../utils/Variables'
import { barrierToString } from '../../utils/EnumToString'
import {  getFilledUserAnswersForProgression } from '../../utils/QuestionAndAnswerUtils'

interface EvaluationSidebarProps
{
    questions: Question[]
    barrier: Barrier
    viewProgression: Progression
    onBarrierSelected: (barrier: Barrier) => void
}

const EvaluationSidebar = ({questions, barrier, viewProgression, onBarrierSelected}: EvaluationSidebarProps) => {
    const azureUniqueId: string = getAzureUniqueId()

    const structure: NavigationStructure[] = Object.entries(Barrier).map(([_, barrier]) => {
        const barrierQuestions = questions.filter(q => q.barrier === barrier)
        const answeredUsersBarrierAnswers = getFilledUserAnswersForProgression(barrierQuestions, viewProgression, azureUniqueId)

        return {
            id: barrier,
            type: 'grouping',
            title: barrierToString(barrier),
            icon: <>{barrier}</>,
            aside: <Chip title={`${answeredUsersBarrierAnswers.length}/${barrierQuestions.length}`} />
        }
    })

    return (
        <NavigationDrawer
            id="navigation-drawer-story"
            structure={structure}
            selectedId={barrier}
            onChangeSelectedId={(selectedBarrierId) => {
                onBarrierSelected(selectedBarrierId as Barrier)
            }}
            onChangeStructure={() => {}}
        />
    )
}

export default EvaluationSidebar
