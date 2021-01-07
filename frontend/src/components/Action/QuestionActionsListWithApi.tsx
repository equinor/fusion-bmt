import { TextArea } from '@equinor/fusion-components'
import React from 'react'

import { Question } from '../../api/models'
import { useCreateActionMutation } from '../../api/mutations'
import { useEvaluation } from '../../globals/contexts'
import QuestionActionsList from './QuestionActionsList'

interface Props {
    question: Question
}

const QuestionActionsListWithApi = ({question}: Props) => {
    const evaluation = useEvaluation()
    const {createAction, error: errorCreatingAction} = useCreateActionMutation()

    if(errorCreatingAction !== undefined){
        return <div>
            <TextArea
                value={`Error creating action: ${JSON.stringify(errorCreatingAction)}`}
                onChange={() => { }}
            />
        </div>
    }

    return <>
        <QuestionActionsList
            question={question}
            participants={evaluation.participants}
            onActionCreate={createAction}
        />
    </>
}

export default QuestionActionsListWithApi
