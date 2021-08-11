import React, { useState } from 'react'
import { Box } from '@material-ui/core'
import { Action, Barrier, Organization } from '../../api/models'
import ActionTable from './ActionTable'
import ActionEditSidebarWithApi from '../Action/EditForm/ActionEditSidebarWithApi'
import { gql, useQuery } from '@apollo/client'
import { useAllPersonDetailsAsync } from '../../utils/hooks'
import { ACTION_FIELDS_FRAGMENT, NOTE_FIELDS_FRAGMENT, PARTICIPANTS_ARRAY_FRAGMENT, QUESTION_FIELDS_FRAGMENT } from '../../api/fragments'

const useActionsQuery = (currentUserId: string) => {
    const GET_ACTIONS = gql`
        query {
            actions(where: { assignedTo: { azureUniqueId: { eq: "${currentUserId}" } } }) {
                ...ActionFields
                notes {
                    ...NoteFields
                }
                question {
                    ...QuestionFields
                    evaluation {
                        name
                        ...ParticipantsArray
                    }
                }
            }
        }
        ${ACTION_FIELDS_FRAGMENT}
        ${NOTE_FIELDS_FRAGMENT}
        ${QUESTION_FIELDS_FRAGMENT}
        ${PARTICIPANTS_ARRAY_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{ actions: Action[] }>(GET_ACTIONS)

    return {
        loading,
        actions: data ? data.actions : [],
        error,
    }
}

type ActionWithAdditionalInfo = {
    action: Action
    barrier: Barrier
    organization: Organization
}

interface Props {
    azureUniqueId: string
}

const ActionTableForOneUserWithApi = ({ azureUniqueId }: Props) => {
    const { actions } = useActionsQuery(azureUniqueId)
    const actionsWithAdditionalInfo = actions.map(action => {
        return { action: action, barrier: action.question.barrier, organization: action.question.organization }
    })

    const { personDetailsList } = useAllPersonDetailsAsync([azureUniqueId])
    const [isEditSidebarOpen, setIsEditSidebarOpen] = useState<boolean>(false)
    const [actionToEdit, setActionToEdit] = useState<ActionWithAdditionalInfo | undefined>()

    const onClose = () => {
        setIsEditSidebarOpen(false)
        setActionToEdit(undefined)
    }

    const openEditActionPanel = (action: Action) => {
        const newActionToEdit = actionsWithAdditionalInfo.find(actionWithInfo => actionWithInfo.action.id === action.id)!
        setIsEditSidebarOpen(true)
        setActionToEdit(newActionToEdit)
    }

    return (
        <Box m={5}>
            <ActionTable
                actionsWithAdditionalInfo={actionsWithAdditionalInfo}
                personDetailsList={personDetailsList}
                onClickAction={openEditActionPanel}
                singleUser={true}
            />
            {actionToEdit !== undefined && (
                <ActionEditSidebarWithApi
                    action={actionToEdit.action}
                    isOpen={isEditSidebarOpen}
                    onClose={onClose}
                    connectedQuestion={actionToEdit.action.question}
                    possibleAssignees={actionToEdit.action.question.evaluation.participants}
                />
            )}
        </Box>
    )
}

export default ActionTableForOneUserWithApi
