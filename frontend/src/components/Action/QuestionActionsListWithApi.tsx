import React from 'react'

import { Question } from '../../api/models'
import { useEvaluation } from '../../globals/contexts'
import QuestionActionsList from './QuestionActionsList'

interface Props {
    question: Question
}

const QuestionActionsListWithApi = ({ question }: Props) => {
    const evaluation = useEvaluation()

    return (
        <>
            <QuestionActionsList question={question} participants={evaluation.participants} />
        </>
    )
}

export default QuestionActionsListWithApi
