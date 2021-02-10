import React, { useEffect, useState } from 'react'

import { PersonDetails } from '@equinor/fusion'
import { DatePicker, SearchableDropdown, SearchableDropdownOption, Select } from '@equinor/fusion-components'
import { Switch, TextField, Typography } from '@equinor/eds-core-react'
import { Grid } from '@material-ui/core'
import styled from 'styled-components'

import { Action, Participant, Priority, Question } from '../../../api/models'
import { barrierToString } from '../../../utils/EnumToString'
import { useEffectNotOnMount } from '../../../utils/hooks'
import { checkIfParticipantValid, checkIfTitleValid, ErrorIcon, TextFieldChangeEvent, Validity } from '../utils'

const RightOrientedDate = styled(Typography)`
    float: right;
`

const RightOrientedSwitch = styled(Switch)`
    float: right;
`

interface Props {
    action: Action
    connectedQuestion: Question
    possibleAssignees: Participant[]
    possibleAssigneesDetails: PersonDetails[]
    onEditShouldDelay: (action: Action, isValid: boolean) => void
    onEditShouldNotDelay: (action: Action, isValid: boolean) => void
}

const ActionEditForm = ({ action, connectedQuestion, possibleAssignees, possibleAssigneesDetails, onEditShouldDelay, onEditShouldNotDelay }: Props) => {
    const [title, setTitle] = useState<string>((action && action.title) || '')
    const [titleValidity, setTitleValidity] = useState<Validity>('default')

    const [assignedToId, setAssignedToId] = useState<string | undefined>(action.assignedTo?.azureUniqueId)
    const assignedTo: Participant | undefined = possibleAssignees.find(a => a.azureUniqueId === assignedToId)
    const [assignedToValidity, setAssignedToValidity] = useState<Validity>('default')

    const [dueDate, setDueDate] = useState<Date>(new Date(action.dueDate))
    const [priority, setPriority] = useState<Priority>(action.priority)
    const [description, setDescription] = useState<string>(action.description)
    const [onHold, setOnHold] = useState<boolean>(action.onHold)
    const [completed, setCompleted] = useState<boolean>(action.completed)

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
            onHold,
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
            onHold,
            dueDate,
            priority,
            completed,
            description,
            assignedTo,
        }
        onEditShouldNotDelay(editedAction, isValid)
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

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <Switch
                        checked={completed}
                        onChange={() => {}} // This is required to avoid an error
                        onClick={() => setCompleted(!completed)}
                        disabled={false}
                        label="Completed"
                    />
                </Grid>
                <Grid item xs={6}>
                    <RightOrientedSwitch
                        checked={onHold}
                        onChange={() => {}} // This is required to avoid an error
                        onClick={() => setOnHold(!onHold)}
                        disabled={false}
                        label="On hold"
                    />
                </Grid>
                <Grid item xs={12}>
                    <RightOrientedDate>Created: {createdDateString}</RightOrientedDate>
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
            </Grid>
        </>
    )
}

export default ActionEditForm
