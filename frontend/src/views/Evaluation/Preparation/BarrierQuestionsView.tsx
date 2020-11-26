
import * as React from 'react'

import { Typography, Divider } from '@equinor/eds-core-react'

import { Barrier, Question } from "../../../api/models"
import QuestionAndAnswerFormWithApi from '../../../components/QuestionAndAnswer/QuestionAndAnswerFormWithApi'
import { barrierToString } from '../../../utils/EnumToString'

interface BarrierQuestionsViewProps
{
    barrier: Barrier
    questions: Question[]
}

const BarrierQuestionsView = ({barrier, questions}: BarrierQuestionsViewProps) => {
    const barrierQuestions = questions.filter(q => q.barrier === barrier)

    return (
        <>
            <Typography variant="h2">{barrierToString(barrier)}</Typography>
            {barrierQuestions.map((question, idx) => {
                return (
                    <div key={question.id}>
                        <Divider />
                        <QuestionAndAnswerFormWithApi
                            questionNumber={idx + 1}
                            question={question}
                        />
                    </div>
                )
            })}
            <br/>
        </>
    )
}

export default BarrierQuestionsView
