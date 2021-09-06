import React, { useEffect, useState } from 'react'

import { PersonDetails } from '@equinor/fusion'
import { DatePicker, SearchableDropdown, SearchableDropdownOption, Select, TextArea } from '@equinor/fusion-components'
import { Button, Icon, TextField, Typography } from '@equinor/eds-core-react'
import { Grid } from '@material-ui/core'
import styled from 'styled-components'

import { Action, Participant, Priority, Question } from '../../../api/models'
import { barrierToString } from '../../../utils/EnumToString'
import { useEffectNotOnMount } from '../../../utils/hooks'
import { checkIfCompleteReasonValid, checkIfParticipantValid, checkIfTitleValid, ErrorIcon, TextFieldChangeEvent, Validity } from '../utils'
import { check_circle_outlined } from '@equinor/eds-icons'

const StyledDate = styled(Typography)`
    float: right;
    margin-top: 10px;
`

interface Props {
    action: Action
    connectedQuestion: Question
    possibleAssignees: Participant[]
    possibleAssigneesDetails: PersonDetails[]
    onEditShouldDelay: (action: Action, isValid: boolean) => void
    onEditShouldNotDelay: (action: Action, isValid: boolean) => void
    createClosingRemark: (text: string) => void
    isClosingRemarkSaved: boolean
    apiErrorClosingRemark: string
    apiErrorAction: string
}

const ActionEditForm = ({
    action,
    connectedQuestion,
    possibleAssignees,
    possibleAssigneesDetails,
    onEditShouldDelay,
    onEditShouldNotDelay,
    isClosingRemarkSaved,
    createClosingRemark,
    apiErrorClosingRemark,
    apiErrorAction,
}: Props) => {
    const [title, setTitle] = useState<string>((action && action.title) || '')
    const [titleValidity, setTitleValidity] = useState<Validity>('default')

    const [assignedToId, setAssignedToId] = useState<string | undefined>(action.assignedTo?.azureUniqueId)
    const assignedTo: Participant | undefined = possibleAssignees.find(a => a.azureUniqueId === assignedToId)
    const [assignedToValidity, setAssignedToValidity] = useState<Validity>('default')

    const [dueDate, setDueDate] = useState<Date>(new Date(action.dueDate))
    const [priority, setPriority] = useState<Priority>(action.priority)
    const [description, setDescription] = useState<string>(action.description)
    const [completed, setCompleted] = useState<boolean>(action.completed)
    const [completeReason, setCompleteReason] = useState<string>('')
    const [completeReasonValidity, setCompleteReasonValidity] = useState<Validity>('default')

    const [completeActionViewOpen, setCompleteActionViewOpen] = useState<boolean>(false)

    const assigneesOptions: SearchableDropdownOption[] = possibleAssigneesDetails.map(personDetails => ({
        title: personDetails.name,
        key: personDetails.azureUniqueId,
        isSelected: personDetails.azureUniqueId === assignedToId,
    }))

    const createdDateString = new Date(action.createDate).toLocaleDateString()

    const checkAndUpdateValidity = () => {
        const isTitleValid = checkIfTitleValid(title)
        const isParticipantValid = checkIfParticipantValid(assignedTo)
        if (!isTitleValid || !isParticipantValid) {
            if (!isTitleValid) {
                setTitleValidity('error')
            }
            if (!isParticipantValid) {
                setAssignedToValidity('error')
            }
            return false
        }
        return true
    }

    useEffectNotOnMount(() => {
        const isValid = checkAndUpdateValidity()
        const editedAction: Action = {
            ...action,
            title,
            dueDate,
            priority,
            completed,
            description,
            assignedTo,
        }
        onEditShouldDelay(editedAction, isValid)
    }, [title, description])

    useEffectNotOnMount(() => {
        const isValid = checkAndUpdateValidity()
        const editedAction: Action = {
            ...action,
            title,
            dueDate,
            priority,
            completed,
            description,
            assignedTo,
        }
        onEditShouldNotDelay(editedAction, isValid)
    }, [assignedTo, dueDate, priority, completed])

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

    useEffect(() => {
        const completeReasonValid = checkIfCompleteReasonValid(completeReason)

        if (completeReasonValidity === 'error') {
            if (completeReasonValid) {
                setCompleteReasonValidity('success')
            }
        } else if (completeReasonValidity === 'success') {
            if (!completeReasonValid) {
                setCompleteReasonValidity('error')
            }
        }
    }, [completeReason, completeReasonValidity])

    useEffect(() => {
        if (action.completed && completeActionViewOpen) {
            createClosingRemark(completeReason)
        }
    }, [action.completed])

    useEffect(() => {
        if (apiErrorAction && completeActionViewOpen) {
            setCompleteActionViewOpen(false)
            setCompleted(false)
        }
    }, [apiErrorAction])

    useEffect(() => {
        if (isClosingRemarkSaved && completeActionViewOpen && !apiErrorClosingRemark) {
            setCompleteReason('')
            setCompleteActionViewOpen(false)
        }
    }, [isClosingRemarkSaved])

    const onCompletedConfirmed = () => {
        const isCompleteReasonValid = checkIfCompleteReasonValid(completeReason)
        const savingClosingRemarkFailedOnPreviousAttempt = apiErrorClosingRemark

        if (!isCompleteReasonValid) {
            setCompleteReasonValidity('error')
        } else {
            if (savingClosingRemarkFailedOnPreviousAttempt) {
                createClosingRemark(completeReason) // If Confirm-button is clicked after a previous fail to save remark, we try saving remark again (no need to set complete-status, because this is already saved)
            } else {
                setCompleted(true)
            }
        }
    }

    const cancelCompleteAction = () => {
        setCompleteReasonValidity('default')
        setCompleteActionViewOpen(false)
    }

    return (
        <>
            <Grid container spacing={3}>
                {action.completed && (
                    <Grid item xs={6}>
                        <div style={{ display: 'flex', flexDirection: 'row' }} data-testid="action_completed_text">
                            <Icon data={check_circle_outlined} style={{ marginRight: '5px' }} />
                            <Typography variant="body_short">Completed</Typography>
                        </div>
                    </Grid>
                )}
                <Grid item xs={action.completed ? 6 : 12}>
                    <StyledDate>Created: {createdDateString}</StyledDate>
                </Grid>
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
                {!completed && (
                    <Grid item xs={12}>
                        <Button
                            style={{ float: 'right' }}
                            onClick={() => {
                                setCompleteActionViewOpen(true)
                                setCompleteReason('')
                            }}
                            disabled={completeActionViewOpen}
                            data-testid="complete_action_button"
                        >
                            Complete action
                        </Button>
                    </Grid>
                )}
                {completeActionViewOpen && (
                    <>
                        <Grid item xs={12}>
                            <Typography variant="h5">Are you sure you want to close the action?</Typography>
                            <Typography variant="body_short">This cannot be undone.</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="completed-reason"
                                value={completeReason}
                                autoFocus={true}
                                label={'Reason for closing action'}
                                onChange={(event: TextFieldChangeEvent) => {
                                    setCompleteReason(event.target.value)
                                }}
                                variant={completeReasonValidity}
                                helperText={completeReasonValidity === 'error' ? 'required' : ''}
                                helperIcon={completeReasonValidity === 'error' ? ErrorIcon : <></>}
                            />
                        </Grid>
                        {apiErrorClosingRemark && (
                            <Grid item xs={12}>
                                <div style={{ marginTop: 20 }}>
                                    <TextArea value={apiErrorClosingRemark} onChange={() => {}} />
                                </div>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <div style={{ float: 'right' }}>
                                <Button
                                    variant="outlined"
                                    style={{ marginRight: '10px' }}
                                    onClick={cancelCompleteAction}
                                    data-testid="complete_action_cancel_button"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    data-testid="complete_action_confirm_button"
                                    onClick={onCompletedConfirmed}
                                    disabled={completeReasonValidity === 'error'}
                                >
                                    {!apiErrorClosingRemark ? 'Confirm' : 'Try again'}
                                </Button>
                            </div>
                        </Grid>
                    </>
                )}
            </Grid>
        </>
    )
}

export default ActionEditForm
