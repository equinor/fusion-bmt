import { QuestionTemplate } from '../../api/models'
import AdminQuestionItem from './AdminQuestionItem'

interface Props {
    barrierQuestions: QuestionTemplate[]
}

const BarrierQuestionList = ({ barrierQuestions }: Props) => {
    const orderedQuestions = barrierQuestions.sort((q1, q2) => q1.order - q2.order)

    return (
        <div>
            {orderedQuestions.map(q => {
                return <AdminQuestionItem key={q.id} question={q} />
            })}
        </div>
    )
}

export default BarrierQuestionList
