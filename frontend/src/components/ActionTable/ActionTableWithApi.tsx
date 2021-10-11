import React, { useMemo, useState } from 'react'
import { Box } from '@material-ui/core'
import { Evaluation } from '../../api/models'
import { useAllPersonDetailsAsync } from '../../utils/hooks'
import ActionTable from './ActionTable'
import ActionEditSidebarWithApi from '../Action/EditForm/ActionEditSidebarWithApi'
import { getActionQuestionsAndEvaluations } from '../../utils/actionUtils'

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
    const [actionIdToEdit, setActionIdToEdit] = useState<string>('')
    const actionQuestionAndEvaluation = actionQuestionAndEvaluations.find(aqe => aqe.action.id === actionIdToEdit)

    const onClose = () => {
        setIsEditSidebarOpen(false)
        setActionIdToEdit('')
    }

    const openEditActionPanel = (actionId: string) => {
        setIsEditSidebarOpen(true)
        setActionIdToEdit(actionId)
    }

    const actionsWithAdditionalInfo = actionQuestionAndEvaluations.map(aqe => {
        return { action: aqe.action, barrier: aqe.question.barrier, organization: aqe.question.organization }
    })

    return (
        <Box m={5}>
            <ActionTable
                actionsWithAdditionalInfo={actionsWithAdditionalInfo}
                personDetailsList={personDetailsList}
                onClickAction={openEditActionPanel}
            />
            {actionIdToEdit !== '' && actionQuestionAndEvaluation !== undefined && (
                <ActionEditSidebarWithApi
                    action={actionQuestionAndEvaluation.action}
                    isOpen={isEditSidebarOpen}
                    onClose={onClose}
                    connectedQuestion={actionQuestionAndEvaluation.question}
                    possibleAssignees={actionQuestionAndEvaluation.evaluation.participants}
                />
            )}
        </Box>
    )
}

export default ActionTableWithApi
