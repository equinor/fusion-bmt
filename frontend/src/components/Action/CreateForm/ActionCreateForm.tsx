import React, { useEffect, useState } from 'react'
import { Button, TextField, Typography, NativeSelect } from '@equinor/eds-core-react'
import { Grid } from '@mui/material'
import { Organization, Participant, Priority, Progression, Question, Role } from '../../../api/models'
import { barrierToString } from '../../../utils/EnumToString'
import { checkIfParticipantValid, checkIfTitleValid, ErrorIcon, TextFieldChangeEvent, Validity } from '../utils'
import { DataToCreateAction } from './ActionCreateSidebarWithApi'
import ButtonWithSaveIndicator from '../../ButtonWithSaveIndicator'
import { toCapitalizedCase } from '../../../utils/helpers'
import { PersonDetails, PersonSelect, PersonSelectEvent } from '@equinor/fusion-react-person'

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
    const [assignedTo, setAssignedTo] = useState<Participant | undefined>(
        possibleAssignees.find(a => a.azureUniqueId === assignedToId)
    )
    const [assignedToValidity, setAssignedToValidity] = useState<Validity>()

    const [dueDate, setDueDate] = useState<Date>(new Date())
    const [priority, setPriority] = useState<Priority>(Priority.High)
    const [description, setDescription] = useState<string>('')

    const assigneesOptions = possibleAssigneesDetails.map(personDetails => ({
        id: personDetails?.azureId,
        title: personDetails?.name,
    }))

    useEffect(() => {
        const foundAssignee = possibleAssignees.find(a => a.azureUniqueId === assignedToId)
        setAssignedTo(foundAssignee)
    }, [possibleAssignees])

    // If user assigned is not in the list of possible assignees, create a new participant
    useEffect(() => {
        const evaluation = possibleAssignees[0].evaluation
        if (assignedToId && !possibleAssignees.find(a => a.azureUniqueId === assignedToId)) {
            const newParticipant: Participant = {
                azureUniqueId: assignedToId,
                createDate: new Date().toISOString(),
                id: '',
                evaluation: evaluation,
                evaluationId: '',
                organization: Organization.All,
                role: Role.Participant,
                progression: Progression.Nomination
            }
            setAssignedTo(newParticipant)
        }
    }, [assignedToId])

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
        if (valid && assignedTo && assignedToId) {
            const newAction: DataToCreateAction = {
                title,
                dueDate,
                priority,
                description,
                azureUniqueId: assignedToId,
                assignedToId: assignedTo!.id,
                questionId: connectedQuestion.id,
            }
            onActionCreate(newAction)
        }
    }

    const onAssigneeSelected = (e: PersonSelectEvent) => {
        const selectedPersonId = e.nativeEvent.detail.selected?.azureId
        setAssignedToId(selectedPersonId)
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
                <Grid item xs={12}>
                    <PersonSelect
                        selectedPerson={assignedToId}
                        dropdownHeight="300px"
                        initialText="The initial text result"
                        leadingIcon="search"
                        onDropdownClosed={function Ki() { }}
                        onSelect={onAssigneeSelected}
                        placeholder="Start to type to search..."
                        variant="page"
                        value=' @equinor.com '
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        label='Due date'
                        id='dueDate'
                        type='date'
                        onChange={(event: TextFieldChangeEvent) => {
                            setDueDate(new Date(event.target.value))
                        }}
                        value={dueDate.toISOString().slice(0, 10)}
                    />
                </Grid>
                <Grid item xs={3}>
                    <NativeSelect
                        label="Priority"
                        id="priority-select"
                        defaultValue={toCapitalizedCase(priority)}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                            const selectedPriority = event.target.value as keyof typeof Priority;
                            setPriority(Priority[selectedPriority]);
                        }}
                    >
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </NativeSelect>


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
            <Grid container spacing={3} style={{ marginTop: '20px' }}>
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
