import React, { useEffect, useState } from 'react'

import { TextArea, ModalSideSheet } from '@equinor/fusion-components'
import { CircularProgress } from '@equinor/eds-core-react'

import { Action, Participant, Question } from '../../../api/models'
import ActionEditForm from './ActionEditForm'
import SaveIndicator from '../../SaveIndicator'
import { SavingState } from '../../../utils/Variables'
import { useAllPersonDetailsAsync, useEffectNotOnMount } from '../../../utils/hooks'
import NotesList from './NotesList'
import NoteCreateForm from './NoteCreateForm'

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
    onClose: () => void
    apiErrorAction: string
    apiErrorNote: string
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
    onChangeNote,
    onCreateNote,
    onClose,
    apiErrorAction,
    apiErrorNote,
}: Props) => {
    const { personDetailsList, isLoading: isLoadingPersonDetails } = useAllPersonDetailsAsync(
        possibleAssignees.map(assignee => assignee.azureUniqueId)
    )
    const [savingState, setSavingState] = useState<SavingState>(SavingState.None)
    const [delayedAction, setDelayedAction] = useState<Action | undefined>(undefined)

    useEffect(() => {
        if (isActionSaving || isNoteSaving) {
            setSavingState(SavingState.Saving)
        } else {
            if (savingState === SavingState.Saving) {
                setSavingState(SavingState.Saved)
            } else {
                setSavingState(SavingState.None)
            }
        }
    }, [isActionSaving, isNoteSaving])

    useEffect(() => {
        if (apiErrorAction || apiErrorNote) {
            setSavingState(SavingState.NotSaved)
        }
    }, [apiErrorAction, apiErrorNote])

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
                <div style={{ margin: 20 }}>
                    {apiErrorAction &&  (
                        <div>
                            <TextArea value={apiErrorAction} onChange={() => {}} />
                        </div>
                    )}
                    <ActionEditForm
                        action={action}
                        connectedQuestion={connectedQuestion}
                        possibleAssignees={possibleAssignees}
                        possibleAssigneesDetails={personDetailsList}
                        onEditShouldDelay={onEditWithDelay}
                        onEditShouldNotDelay={onEditWithoutDelay}
                    />
                    {apiErrorNote &&  (
                        <div style={{ marginTop: 20 }}>
                            <TextArea value={apiErrorNote} onChange={() => {}} />
                        </div>
                    )}
                    <NoteCreateForm
                        text={note}
                        onChange={onChangeNote}
                        onCreateClick={onCreateNote}
                        disabled={isNoteSaving}
                    />
                    <NotesList notes={action.notes} participantsDetails={personDetailsList} />
                </div>
            )}
        </ModalSideSheet>
    )
}

export default ActionEditSidebar
