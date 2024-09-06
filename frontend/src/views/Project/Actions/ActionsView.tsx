import { useState } from 'react'
import { ApolloError, gql, useQuery } from '@apollo/client'
import { Box } from '@mui/material'
import ErrorMessage from '../../../components/ErrorMessage'

import { useAllPersonDetailsAsync } from '../../../utils/hooks'
import { Action } from '../../../api/models'
import ActionTable from '../../../components/ActionTable/ActionTable'
import ActionEditSidebarWithApi from '../../../components/Action/EditForm/ActionEditSidebarWithApi'
import {
    ACTION_FIELDS_FRAGMENT,
    CLOSING_REMARK_FIELDS_FRAGMENT,
    NOTE_FIELDS_FRAGMENT,
    PARTICIPANTS_ARRAY_FRAGMENT,
    QUESTION_FIELDS_FRAGMENT,
} from '../../../api/fragments'
import { CircularProgress } from '@equinor/eds-core-react'
import { centered } from '../../../utils/styles'
import { genericErrorMessage } from '../../../utils/Variables'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'

interface Props {
    azureUniqueId: string
}

const ActionsView = ({ azureUniqueId }: Props) => {
    const { currentContext } = useModuleCurrentContext()

    const { loading: loadingActions, actions, error: errorLoadingActions } = useActionsQuery(azureUniqueId)
    const nonCancelledActions = actions.filter(a => !a.isVoided)
    const actionsWithAdditionalInfo = nonCancelledActions.map(action => {
        return { action: action, barrier: action.question.barrier, organization: action.question.organization }
    })

    const { personDetailsList } = useAllPersonDetailsAsync([azureUniqueId])
    const [isFetchingProjects, setIsFetchingProjects] = useState<boolean>(false)
    const [isEditSidebarOpen, setIsEditSidebarOpen] = useState<boolean>(false)
    const [actionIdToEdit, setActionIdToEdit] = useState<string>('')
    const actionToEdit = actionsWithAdditionalInfo.find(actionWithInfo => actionWithInfo.action.id === actionIdToEdit)
    const currentProjectActions = actionsWithAdditionalInfo.filter(actionWithInfo => actionWithInfo.action.question.evaluation.project.externalId === currentContext?.externalId)

    const isFetchingData = loadingActions || isFetchingProjects

    const onClose = () => {
        setIsEditSidebarOpen(false)
        setActionIdToEdit('')
    }

    const openEditActionPanel = (actionId: string) => {
        setIsEditSidebarOpen(true)
        setActionIdToEdit(actionId)
    }

    return (
        <Box m={5}>
            {isFetchingData && (
                <div style={centered}>
                    <CircularProgress />
                </div>
            )}
            {!isFetchingData && errorLoadingActions !== undefined && (
                <ErrorMessage title="Error" message={genericErrorMessage} />
            )}
            {!isFetchingData && errorLoadingActions === undefined && actionsWithAdditionalInfo.length > 0 && (
                <ActionTable
                    actionsWithAdditionalInfo={currentContext?.externalId ? currentProjectActions : actionsWithAdditionalInfo}
                    personDetailsList={personDetailsList}
                    onClickAction={openEditActionPanel}
                    showEvaluations={true}
                />
            )}
            {actionIdToEdit !== '' && actionToEdit !== undefined && (
                <ActionEditSidebarWithApi
                    action={actionToEdit.action}
                    isOpen={isEditSidebarOpen}
                    onClose={onClose}
                    connectedQuestion={actionToEdit.action.question}
                    possibleAssignees={actionToEdit.action.question.evaluation.participants}
                    isEditingFromDashboard={true}
                />
            )}
        </Box>
    )
}

export default ActionsView

interface ActionsQueryProps {
    loading: boolean
    actions: Action[]
    error: ApolloError | undefined
}

const useActionsQuery = (currentUserId: string): ActionsQueryProps => {
    const GET_ACTIONS = gql`
        query {
            actions(where: { assignedTo: { azureUniqueId: { eq: "${currentUserId}" } } }) {
                ...ActionFields
                notes {
                    ...NoteFields
                }
                closingRemarks {
                    ...ClosingRemarkFields
                }
                question {
                    ...QuestionFields
                    evaluation {
                        name
                        ...ParticipantsArray
                        project {
                            externalId
                        }
                    }
                }
            }
        }
        ${ACTION_FIELDS_FRAGMENT}
        ${NOTE_FIELDS_FRAGMENT}
        ${CLOSING_REMARK_FIELDS_FRAGMENT}
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
