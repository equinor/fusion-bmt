import { TextArea } from '@equinor/fusion-components'
import React from 'react'

import { Question } from '../../api/models'
import { useCreateActionMutation, useEditActionMutation, useCreateNoteMutation } from '../../api/mutations'
import { useEvaluation } from '../../globals/contexts'
import QuestionActionsList from './QuestionActionsList'

interface Props {
    question: Question
}

const QuestionActionsListWithApi = ({ question }: Props) => {
    const evaluation = useEvaluation()
    const { createAction, error: errorCreatingAction } = useCreateActionMutation()
    const { editAction, loading, error: errorEditingAction } = useEditActionMutation()
    const { createNote, error: errorCreatingNote } = useCreateNoteMutation()

    if (errorCreatingAction !== undefined) {
        return (
            <div>
                <TextArea value={`Error creating action: ${JSON.stringify(errorCreatingAction)}`} onChange={() => {}} />
            </div>
        )
    }

    if (errorEditingAction !== undefined) {
        return (
            <div>
                <TextArea value={`Error editing action: ${JSON.stringify(errorEditingAction)}`} onChange={() => {}} />
            </div>
        )
    }

    if (errorCreatingNote !== undefined) {
        return (
            <div>
                <TextArea value={`Error creating note: ${JSON.stringify(errorCreatingNote)}`} onChange={() => {}} />
            </div>
        )
    }

    return (
        <>
            <QuestionActionsList
                question={question}
                isActionSaving={loading}
                participants={evaluation.participants}
                onActionCreate={createAction}
                onActionEdit={editAction}
                onNoteCreate={createNote}
            />
        </>
    )
}

export default QuestionActionsListWithApi
