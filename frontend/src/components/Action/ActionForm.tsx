import React, { useEffect, useState } from 'react'

import { PersonDetails } from '@equinor/fusion'
import { DatePicker, SearchableDropdown, SearchableDropdownOption, Select } from '@equinor/fusion-components'
import { Button, Icon, Switch, TextField, TextFieldProps, Typography } from '@equinor/eds-core-react'
import { add, error_filled } from '@equinor/eds-icons'

import { Action, Participant, Priority, Question } from '../../api/models'
import { Grid } from '@material-ui/core'
import { barrierToString } from '../../utils/EnumToString'
import { DataToCreateAction } from '../../api/mutations'
import styled from 'styled-components'
import ActionNotesList from './ActionNotesList'
import { SavingState } from '../../utils/Variables'
import { useEffectNotOnMount } from '../../utils/hooks'

const WRITE_DELAY_MS = 1000

const RightOrientedDate = styled(Typography)`
    float: right;
`

const RightOrientedSwitch = styled(Switch)`
    float: right;
`

type TextFieldChangeEvent = React.ChangeEvent<HTMLTextAreaElement> & React.ChangeEvent<HTMLInputElement>

type Validity = Exclude<TextFieldProps['variant'], undefined | 'warning'>

const ErrorIcon = <Icon size={16} data={error_filled} color="danger" />

const checkIfTitleValid = (title: string) => {
    return title.length > 0
}

const checkIfParticipantValid = (participant: Participant | undefined) => {
    return participant !== undefined
}

interface Props {
    action?: Action
    connectedQuestion: Question
    possibleAssignees: Participant[]
    possibleAssigneesDetails: PersonDetails[]
    onActionCreate: (action: DataToCreateAction) => void
    onActionEdit: (action: Action) => void
    onNoteCreate: (actionId: string, text: string) => void
    onCancelClick: () => void
    setSavingState: (savingState: SavingState) => void
}

const ActionForm = ({
    action,
    connectedQuestion,
    possibleAssignees,
    possibleAssigneesDetails,
    onActionCreate,
    onActionEdit,
    onNoteCreate,
    onCancelClick,
    setSavingState,
}: Props) => {
    const [title, setTitle] = useState<string>((action && action.title) || '')
    const [titleValidity, setTitleValidity] = useState<Validity>('default')
    const [assignedToId, setAssignedToId] = useState<string | undefined>(
        (action && action.assignedTo && action.assignedTo.azureUniqueId) || undefined
    )
    const assignedTo: Participant | undefined = possibleAssignees.find(a => a.azureUniqueId === assignedToId)
    const [assignedToValidity, setAssignedToValidity] = useState<Validity>('default')

    const [dueDate, setDueDate] = useState<Date>((action && new Date(action.dueDate)) || new Date())
    const [priority, setPriority] = useState<Priority>(action?.priority || Priority.High)
    const [description, setDescription] = useState<string>(action?.description || '')
    const [onHold, setOnHold] = useState<boolean>(action?.onHold || false)
    const [completed, setCompleted] = useState<boolean>(action?.completed || false)
    const [noteInProgress, setNoteInProgress] = useState<string>('')

    const assigneesOptions: SearchableDropdownOption[] = possibleAssigneesDetails.map(personDetails => ({
        title: personDetails.name,
        key: personDetails.azureUniqueId,
        isSelected: personDetails.azureUniqueId === assignedToId,
    }))

    const createdDateString = new Date(action?.createDate).toLocaleDateString()
    const isEditMode = action !== undefined

    const saveChanges = () => {
        if (action) {
            const valid = setFormValidity()
            if (valid) {
                const editedAction: Action = {
                    ...action,
                    title,
                    onHold,
                    dueDate,
                    priority,
                    completed,
                    description,
                    assignedTo,
                }
                onActionEdit(editedAction)
            }
        }
    }

    useEffectNotOnMount(() => {
        if (action !== undefined) {
            setSavingState(SavingState.Saving)
            const timeout = setTimeout(() => {
                saveChanges()
            }, WRITE_DELAY_MS)
            return () => {
                clearTimeout(timeout)
            }
        }
    }, [title, description])

    useEffectNotOnMount(() => {
        if (action !== undefined) {
            setSavingState(SavingState.Saving)
            saveChanges()
        }
    }, [assignedTo, onHold, dueDate, priority, completed])

    useEffect(() => {
        if (titleValidity === 'error') {
            if (checkIfTitleValid(title)) {
                setTitleValidity('success')
            }
        } else if (titleValidity === 'success') {
            if (!checkIfTitleValid(title)) {
                setTitleValidity('error')
            }
        }
    }, [title, titleValidity])

    useEffect(() => {
        if (assignedToValidity === 'error') {
            if (checkIfParticipantValid(assignedTo)) {
                setAssignedToValidity('success')
            }
        } else if (assignedToValidity === 'success') {
            if (!checkIfParticipantValid(assignedTo)) {
                setAssignedToValidity('error')
            }
        }
    }, [assignedTo])

    const setFormValidity = () => {
        const isTitleValid = checkIfTitleValid(title)
        const isParticipantValid = checkIfParticipantValid(assignedTo)
        if (!isTitleValid || !isParticipantValid) {
            if (!isTitleValid) {
                setTitleValidity('error')
            }
            if (!isParticipantValid) {
                setAssignedToValidity('error')
            }
            setSavingState(SavingState.None)
            return false
        }
        return true
    }

    const onLocalCreateClick = () => {
        const valid = setFormValidity()
        if (valid) {
            const newAction: DataToCreateAction = {
                title,
                dueDate,
                priority,
                description,
                assignedToId: assignedTo!.id,
                questionId: connectedQuestion.id,
            }
            onActionCreate(newAction)
        }
    }

    const addNote = () => {
        if (noteInProgress.length > 0 && action) {
            onNoteCreate(action.id, noteInProgress)
            setNoteInProgress('')
        }
    }

    return (
        <>
            <Grid container spacing={3}>
                {isEditMode && (
                    <>
                        <Grid item xs={6}>
                            <Switch
                                checked={completed}
                                onChange={() => {}} // This is required to avoid an error
                                onClick={() => setCompleted(!completed)}
                                disabled={false}
                                label="Completed"
                                enterKeyHint="" // This is required to avoid an error
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <RightOrientedSwitch
                                checked={onHold}
                                onChange={() => {}} // This is required to avoid an error
                                onClick={() => setOnHold(!onHold)}
                                disabled={false}
                                label="On hold"
                                enterKeyHint="" // This is required to avoid an error
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <RightOrientedDate>Created: {createdDateString}</RightOrientedDate>
                        </Grid>
                    </>
                )}
                <Grid item xs={12}>
                    <TextField
                        id="title"
                        value={title}
                        autoFocus={true}
                        label="Title"
                        onChange={(event: TextFieldChangeEvent) => {
                            setTitle(event.target.value)
                        }}
                        variant={titleValidity}
                        helperText={titleValidity === 'error' ? 'required' : ''}
                        helperIcon={titleValidity === 'error' ? ErrorIcon : <></>}
                    />
                </Grid>
                <Grid item xs={5}>
                    <SearchableDropdown
                        label="Assigned to"
                        error={assignedToValidity === 'error'}
                        errorMessage="required"
                        options={assigneesOptions}
                        onSelect={option => setAssignedToId(option.key)}
                    />
                </Grid>
                <Grid item xs={4}>
                    <DatePicker
                        label="Due date"
                        onChange={newDate => setDueDate(newDate !== null ? newDate : new Date())}
                        selectedDate={dueDate}
                    />
                </Grid>
                <Grid item xs={3}>
                    <Typography group="input" variant="label">
                        Priority
                    </Typography>
                    <Select
                        options={[
                            {
                                key: Priority.High,
                                title: 'High',
                                isSelected: priority === Priority.High,
                            },
                            {
                                key: Priority.Medium,
                                title: 'Medium',
                                isSelected: priority === Priority.Medium,
                            },
                            {
                                key: Priority.Low,
                                title: 'Low',
                                isSelected: priority === Priority.Low,
                            },
                        ]}
                        onSelect={option => {
                            setPriority(option.key as Priority)
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h5">Connected to {connectedQuestion.evaluation.name}</Typography>
                    <Typography variant="body_short">
                        {barrierToString(connectedQuestion.barrier)} - {connectedQuestion.text}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="description"
                        value={description}
                        multiline
                        label="Description"
                        onChange={(event: TextFieldChangeEvent) => {
                            setDescription(event.target.value)
                        }}
                        variant="default"
                        style={{ height: 150 }}
                    />
                </Grid>
                {isEditMode && (
                    <>
                        <Grid item xs={10}>
                            <TextField
                                id="noteInProgress"
                                value={noteInProgress}
                                multiline
                                label="Notes"
                                onChange={(event: TextFieldChangeEvent) => setNoteInProgress(event.target.value)}
                                onKeyPress={(e: any) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        addNote()
                                    }
                                }}
                                variant="default"
                                style={{ height: 75 }}
                            />
                        </Grid>
                        <Grid item xs={2} container={true} alignItems="center">
                            <Button variant="ghost" onClick={addNote}>
                                <Icon data={add}></Icon>
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <ActionNotesList notes={action!.notes} participantsDetails={possibleAssigneesDetails} />
                        </Grid>
                    </>
                )}
            </Grid>
            {!isEditMode && (
                <>
                    <Grid container spacing={3} justify="flex-end">
                        <Grid item>
                            <Button variant="outlined" onClick={onCancelClick}>
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button onClick={onLocalCreateClick}>Create</Button>
                        </Grid>
                    </Grid>
                </>
            )}
        </>
    )
}

export default ActionForm
