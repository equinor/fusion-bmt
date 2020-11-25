import * as React from 'react'
import { Answer, Barrier, Question } from '../../api/models'
import { NavigationStructure, Chip, NavigationDrawer } from '@equinor/fusion-components'
import { getAzureUniqueId } from '../../utils/Variables'
import { barrierToString } from '../../utils/EnumToString'
import { checkIfAnswerFilled } from '../../utils/QuestionAndAnswerUtils'


interface EvaluationSidebarProps
{
    questions: Question[]
    barrier: Barrier
    onBarrierSelected: (barrier: Barrier) => void
}

const EvaluationSidebar = ({questions, barrier, onBarrierSelected}: EvaluationSidebarProps) => {
    const azureUniqueId: string = getAzureUniqueId()

    const structure: NavigationStructure[] = Object.entries(Barrier).map(([barrierKey, barrier]) => {
        const barrierQuestions = questions.filter(q => q.barrier == barrier)
        const barrierAnswers = barrierQuestions.reduce((acc: Answer[], cur: Question) => {
            return acc.concat(cur.answers)
        }, [] as Answer[])
        const usersBarrierAnswers = barrierAnswers.filter(a => a.answeredBy?.azureUniqueId === azureUniqueId)
        const answeredUsersBarrierAnswers = usersBarrierAnswers.filter(a => checkIfAnswerFilled(a))

        return {
            id: barrier,
            type: 'grouping',
            title: barrierToString(barrier),
            icon: <>{barrierKey}</>,
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
