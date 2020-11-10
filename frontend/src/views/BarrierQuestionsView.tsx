
import * as React from 'react';

import { Typography, Divider } from '@equinor/eds-core-react';

import { Question, Answer, Participant } from "../api/models"
import QuestionAndAnswerForm from "../components/QuestionAndAnswer/QuestionAndAnswerForm"

interface BarrierQuestionsViewProps
{
    barrier: string
    questions: Question[]
    participant: Participant
}

const BarrierQuestionsView = ({barrier, questions, participant}: BarrierQuestionsViewProps) => {
    return (
        <>
            <Typography variant="h2">{barrier}</Typography>
            {questions.map((question, idx) => {
                return (
                    <div key={question.id}>
                        <Divider />
                        <QuestionAndAnswerForm
                            question={question}
                            answer={question.answers.find(a => a.answeredBy.id == participant.id)!}
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

export default BarrierQuestionsView;
