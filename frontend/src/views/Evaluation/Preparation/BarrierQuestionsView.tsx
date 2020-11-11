
import * as React from 'react'

import { Typography, Divider } from '@equinor/eds-core-react'

import { Question, Answer } from "../../../api/models"
import QuestionAndAnswerForm from "../../../components/QuestionAndAnswer/QuestionAndAnswerForm"
import { useCurrentUser } from '@equinor/fusion'

interface BarrierQuestionsViewProps
{
    barrier: string
    questions: Question[]
}

const BarrierQuestionsView = ({barrier, questions}: BarrierQuestionsViewProps) => {
    const user = useCurrentUser()
    const azureUniqueId: string = user?.id as string

    return (
        <>
            <Typography variant="h2">{barrier}</Typography>
            {questions.map((question, idx) => {
                return (
                    <div key={question.id}>
                        <Divider />
                        <QuestionAndAnswerForm
                            question={question}
                            answer={question.answers.find(a => a.answeredBy.azureUniqueId == azureUniqueId)!}
                            questionNumber={idx + 1}
                            onAnswerChange = {(_: Answer) => {

                            }}
                        />
                    </div>
                )
            })}
            <br/>
        </>
    )
}

export default BarrierQuestionsView
