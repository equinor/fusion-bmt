import React, { useMemo, useState } from 'react'
import { Box } from '@material-ui/core'
import { Action, Evaluation, Participant, Question } from '../../api/models'
import { useAllPersonDetailsAsync } from '../../utils/hooks'
import ActionTable from './ActionTable'
import ActionEditSidebarWithApi from '../Action/EditForm/ActionEditSidebarWithApi'

const getActionQuestionsAndEvaluations = (evaluations: Evaluation[]): ActionQuestionAndEvaluation[] => {
    const actionQuestionAndEvaluations: ActionQuestionAndEvaluation[] = []

    evaluations.forEach(evaluation => {
        evaluation.questions.forEach((question: Question) => {
            question.actions.forEach(action => {
                actionQuestionAndEvaluations.push({ action, question, evaluation })
            })
        })
    })

    return actionQuestionAndEvaluations
}

interface ActionQuestionAndEvaluation {
    action: Action
    question: Question
    evaluation: Evaluation
}

interface Props {
    evaluations: Evaluation[]
}

const ActionTableWithApi = ({ evaluations }: Props) => {
    const actionQuestionAndEvaluations = useMemo(() => getActionQuestionsAndEvaluations(evaluations), [evaluations])

    const allAzureUniqueIds: string[] = evaluations.reduce((acc: string[], curr: Evaluation) => {
        const newIds = curr.participants.map(p => p.azureUniqueId).filter(id => !acc.includes(id))
        return acc.concat(newIds)
    }, [] as string[])

    const { personDetailsList } = useAllPersonDetailsAsync(allAzureUniqueIds)
    const [isEditSidebarOpen, setIsEditSidebarOpen] = useState<boolean>(false)
    const [aqeToEdit, setAqeToEdit] = useState<ActionQuestionAndEvaluation | undefined>()

    const onClose = () => {
        setIsEditSidebarOpen(false)
        setAqeToEdit(undefined)
    }

    const openEditActionPanel = (action: Action) => {
        const newAqeToEdit = actionQuestionAndEvaluations.find(aqe => aqe.action.id === action.id)!
        setIsEditSidebarOpen(true)
        setAqeToEdit(newAqeToEdit)
    }

    const actions = actionQuestionAndEvaluations.map(aqe => aqe.action)

    return (
        <Box m={5}>
            <ActionTable actions={actions} personDetailsList={personDetailsList} onClickAction={openEditActionPanel} />
            {aqeToEdit !== undefined && (
                <ActionEditSidebarWithApi
                    action={aqeToEdit.action}
                    isOpen={isEditSidebarOpen}
                    onClose={onClose}
                    connectedQuestion={aqeToEdit.question}
                    possibleAssignees={aqeToEdit.evaluation.participants}
                />
            )}
        </Box>
    )
}

export default ActionTableWithApi
