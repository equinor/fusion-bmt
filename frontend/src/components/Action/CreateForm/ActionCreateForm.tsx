import React, { useEffect, useState } from 'react'

import { PersonDetails } from '@equinor/fusion'
import { DatePicker, SearchableDropdown, SearchableDropdownOption, Select } from '@equinor/fusion-components'
import { Button, TextField, Typography } from '@equinor/eds-core-react'
import { Grid } from '@material-ui/core'

import { Participant, Priority, Question } from '../../../api/models'
import { barrierToString } from '../../../utils/EnumToString'
import { checkIfParticipantValid, checkIfTitleValid, ErrorIcon, TextFieldChangeEvent, Validity } from '../utils'
import { DataToCreateAction } from './ActionCreateSidebarWithApi'
import ButtonWithSaveIndicator from '../../ButtonWithSaveIndicator'

interface Props {
    connectedQuestion: Question
    possibleAssignees: Participant[]
    possibleAssigneesDetails: PersonDetails[]
    onActionCreate: (action: DataToCreateAction) => void
    onCancelClick: () => void
    disableCreate: boolean
    creatingAction: boolean
}

const ActionCreateForm = ({
    connectedQuestion,
    possibleAssignees,
    possibleAssigneesDetails,
    onActionCreate,
    onCancelClick,
    disableCreate,
    creatingAction,
}: Props) => {
    const [title, setTitle] = useState<string>('')
    const [titleValidity, setTitleValidity] = useState<Validity>()

    const [assignedToId, setAssignedToId] = useState<string | undefined>(undefined)
    const assignedTo: Participant | undefined = possibleAssignees.find(a => a.azureUniqueId === assignedToId)
    const [assignedToValidity, setAssignedToValidity] = useState<Validity>()

    const [dueDate, setDueDate] = useState<Date>(new Date())
    const [priority, setPriority] = useState<Priority>(Priority.High)
    const [description, setDescription] = useState<string>('')

    const assigneesOptions: SearchableDropdownOption[] = possibleAssigneesDetails.map(personDetails => ({
        title: personDetails.name,
        key: personDetails.azureUniqueId,
        isSelected: personDetails.azureUniqueId === assignedToId,
    }))

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

    return (
        <>
            <Grid container spacing={3}>
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
                        style={{ height: 150 }}
                    />
                </Grid>
            </Grid>
            <Grid container spacing={3} justify="flex-end" style={{ marginTop: '20px' }}>
                <Grid item>
                    <Button variant="outlined" onClick={onCancelClick}>
                        Cancel
                    </Button>
                </Grid>
                <Grid item>
                    <ButtonWithSaveIndicator onClick={onLocalCreateClick} disabled={disableCreate} isLoading={creatingAction}>
                        Create
                    </ButtonWithSaveIndicator>
                </Grid>
            </Grid>
        </>
    )
}

export default ActionCreateForm
