import React, { useEffect, useState } from 'react'

import { TextArea, ModalSideSheet } from '@equinor/fusion-components'
import { CircularProgress } from '@equinor/eds-core-react'

import { Action, ClosingRemark, Note, Participant, Question } from '../../../api/models'
import ActionEditForm from './ActionEditForm'
import SaveIndicator from '../../SaveIndicator'
import { SavingState } from '../../../utils/Variables'
import { useAllPersonDetailsAsync, useEffectNotOnMount } from '../../../utils/hooks'
import NotesAndClosingRemarksList from './NotesAndClosingRemarksList'
import NoteCreateForm from './NoteCreateForm'
import { useParticipant } from '../../../globals/contexts'
import { deriveNewSavingState } from '../../../views/helpers'
import { disableActionEdit } from '../../../utils/disableComponents'
import { ApolloError } from '@apollo/client'

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
    const [savingState, setSavingState] = useState<SavingState>(SavingState.None)
    const [delayedAction, setDelayedAction] = useState<Action | undefined>(undefined)
    const notesAndClosingRemarks: (Note | ClosingRemark)[] = action.notes.map(note => note)

    const participant = useParticipant()

    if (action.closingRemarks !== undefined) {
        action.closingRemarks.forEach(closingRemark => {
            notesAndClosingRemarks.push(closingRemark)
        })
    }

    useEffect(() => {
        setSavingState(deriveNewSavingState(isActionSaving, savingState))
    }, [isActionSaving])

    useEffect(() => {
        if (apiErrorAction !== undefined) {
            setSavingState(SavingState.NotSaved)
        }
    }, [apiErrorAction])

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
        <ModalSideSheet
            header={`Edit Action`}
            show={open}
            size="large"
            onClose={onClose}
            isResizable={false}
            headerIcons={[<SaveIndicator savingState={savingState} />]}
        >
            {isLoadingPersonDetails && (
                <div style={{ textAlign: 'center' }}>
                    <CircularProgress />
                </div>
            )}
            {!isLoadingPersonDetails && (
                <div style={{ margin: 20 }} data-testid="edit_action_dialog_body">
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
        </ModalSideSheet>
    )
}

export default ActionEditSidebar
