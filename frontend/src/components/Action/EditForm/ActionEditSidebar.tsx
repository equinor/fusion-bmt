import React, { useState } from 'react'
import { CircularProgress } from '@equinor/eds-core-react'
import { Action, ClosingRemark, Note, Participant, Question } from '../../../api/models'
import ActionEditForm from './ActionEditForm'
import SaveIndicator from '../../SaveIndicator'
import { SavingState } from '../../../utils/Variables'
import { useAllPersonDetailsAsync, useEffectNotOnMount, useSavingStateCheck } from '../../../utils/hooks'
import NotesAndClosingRemarksList from './NotesAndClosingRemarksList'
import NoteCreateForm from './NoteCreateForm'
import { useParticipant } from '../../../globals/contexts'
import { disableActionEdit } from '../../../utils/disableComponents'
import { ApolloError } from '@apollo/client'
import SideSheet from '@equinor/fusion-react-side-sheet'

const WRITE_DELAY_MS = 1000

interface Props {
    action: Action
    isActionSaving: boolean
    isNoteSaving: boolean
    open: boolean
    connectedQuestion: Question
    possibleAssignees: Participant[]
    onActionEdit: (action: Action) => void
    note: string
    onChangeNote: (text: string) => void
    onCreateNote: (text: string) => void
    onCreateClosingRemark: (text: string) => void
    isClosingRemarkSaved: boolean
    onClose: () => void
    apiErrorAction: ApolloError | undefined
    apiErrorNote: ApolloError | undefined
    apiErrorClosingRemark: ApolloError | undefined
    isEditingFromDashboard?: boolean
}

const ActionEditSidebar = ({
    action,
    isActionSaving,
    isNoteSaving,
    open,
    connectedQuestion,
    possibleAssignees,
    onActionEdit,
    note,
    isClosingRemarkSaved,
    onChangeNote,
    onCreateNote,
    onCreateClosingRemark,
    onClose,
    apiErrorAction,
    apiErrorNote,
    apiErrorClosingRemark,
    isEditingFromDashboard = false,
}: Props) => {
    const { personDetailsList, isLoading: isLoadingPersonDetails } = useAllPersonDetailsAsync(
        possibleAssignees.map(assignee => assignee.azureUniqueId)
    )
    const { savingState, setSavingState } = useSavingStateCheck(isActionSaving, apiErrorAction !== undefined)
    const [delayedAction, setDelayedAction] = useState<Action | undefined>(undefined)
    const notesAndClosingRemarks: (Note | ClosingRemark)[] = action.notes.map(note => note)

    const participant = useParticipant()

    if (action.closingRemarks !== undefined) {
        action.closingRemarks.forEach(closingRemark => {
            notesAndClosingRemarks.push(closingRemark)
        })
    }

    const onEditWithoutDelay = (action: Action, isValid: boolean) => {
        if (isValid) {
            setDelayedAction(undefined)
            onActionEdit(action)
        } else {
            setSavingState(SavingState.NotSaved)
            setDelayedAction(undefined)
        }
    }

    const onEditWithDelay = (action: Action, isValid: boolean) => {
        if (isValid) {
            setDelayedAction(action)
        } else {
            setSavingState(SavingState.NotSaved)
            setDelayedAction(undefined)
        }
    }

    useEffectNotOnMount(() => {
        if (delayedAction !== undefined) {
            const timeout = setTimeout(() => {
                onActionEdit(delayedAction)
            }, WRITE_DELAY_MS)
            return () => {
                clearTimeout(timeout)
            }
        }
    }, [delayedAction])

    return (
        <SideSheet
            isOpen={open}
            minWidth={400}
            onClose={onClose}
        >
            <SideSheet.Title title="Edit Action" />
            <SideSheet.SubTitle subTitle="" />
            <SideSheet.Actions>
                <SaveIndicator savingState={savingState} />
            </SideSheet.Actions>
            <SideSheet.Content>
            {isLoadingPersonDetails && (
                <div style={{ textAlign: 'center' }}>
                    <CircularProgress />
                </div>
            )}
            {!isLoadingPersonDetails && (
                <div data-testid="edit_action_dialog_body">
                    <ActionEditForm
                        action={action}
                        connectedQuestion={connectedQuestion}
                        possibleAssignees={possibleAssignees}
                        possibleAssigneesDetails={personDetailsList}
                        onEditShouldDelay={onEditWithDelay}
                        onEditShouldNotDelay={onEditWithoutDelay}
                        createClosingRemark={text => onCreateClosingRemark(text)}
                        isClosingRemarkSaved={isClosingRemarkSaved}
                        apiErrorClosingRemark={apiErrorClosingRemark}
                        apiErrorAction={apiErrorAction}
                        disableEditAction={disableActionEdit(isEditingFromDashboard, participant, action)}
                    />
                    <NoteCreateForm
                        text={note}
                        onChange={onChangeNote}
                        onCreateClick={onCreateNote}
                        disabled={isNoteSaving || disableActionEdit(isEditingFromDashboard, participant, action)}
                        isCreatingNote={isNoteSaving}
                        apiErrorNote={apiErrorNote}
                    />
                    <NotesAndClosingRemarksList notesAndClosingRemarks={notesAndClosingRemarks} participantsDetails={personDetailsList} />
                </div>
            )}
            </SideSheet.Content>
        </SideSheet>
    )
}

export default ActionEditSidebar
