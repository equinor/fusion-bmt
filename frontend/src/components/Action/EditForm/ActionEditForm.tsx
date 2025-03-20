import React, { useEffect, useState } from 'react'
import { Button, Icon, TextField, Typography, NativeSelect } from '@equinor/eds-core-react'
import { Grid } from '@mui/material'
import styled from 'styled-components'
import { Action, Organization, Participant, Priority, Progression, Question, Role } from '../../../api/models'
import { barrierToString } from '../../../utils/EnumToString'
import { useEffectNotOnMount, useShowErrorHook } from '../../../utils/hooks'
import { checkIfParticipantValid, checkIfTitleValid, ErrorIcon, TextFieldChangeEvent, Validity } from '../utils'
import { check_circle_outlined, link } from '@equinor/eds-icons'
import { updateValidity } from '../../../views/helpers'
import { tokens } from '@equinor/eds-tokens'
import { ApolloError } from '@apollo/client'
import ErrorBanner from '../../ErrorBanner'
import { genericErrorMessage } from '../../../utils/Variables'
import { toCapitalizedCase } from '../../../utils/helpers'
import SearchableDropdown from '../../../components/SearchableDropDown'
import { PersonDetails, PersonSelect, PersonSelectEvent } from '@equinor/fusion-react-person'


const StyledDate = styled(Typography)`
    float: right;
    margin-top: 10px;
`

const LinkIcon = styled(Icon)`
    position: absolute;
    right: 15px;
    top: -3px;
    cursor: pointer;
    color: ${tokens.colors.text.static_icons__secondary.rgba};

    &:hover {
        color: ${tokens.colors.text.static_icons__default.rgba};
    }
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
    apiErrorClosingRemark: ApolloError | undefined
    apiErrorAction: ApolloError | undefined
    disableEditAction: boolean
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
    disableEditAction,
}: Props) => {
    const [title, setTitle] = useState<string>((action && action.title) || '')
    const [titleValidity, setTitleValidity] = useState<Validity>()

    const [assignedToId, setAssignedToId] = useState<string | undefined>(action.assignedTo?.azureUniqueId)
    const [assignedTo, setAssignedTo] = useState<Participant | undefined>(
        possibleAssignees.find(a => a.azureUniqueId === assignedToId)
    )
    const [assignedToValidity, setAssignedToValidity] = useState<Validity>()

    const [dueDate, setDueDate] = useState<Date>(new Date(action.dueDate))
    const [priority, setPriority] = useState<Priority>(action.priority)
    const [description, setDescription] = useState<string>(action.description)
    const [completed, setCompleted] = useState<boolean>(action.completed)
    const [completeActionViewOpen, setCompleteActionViewOpen] = useState<boolean>(false)
    const [completingReason, setCompletingReason] = useState<string>('')
    const { showErrorMessage, setShowErrorMessage } = useShowErrorHook(apiErrorAction)
    const { showErrorMessage: showClosingNoteErrorMessage, setShowErrorMessage: setShowClosingNoteErrorMessage } =
        useShowErrorHook(apiErrorClosingRemark)

    const [assigneesOptions, setAssigneesOptions] = useState<{ id: string; title: string | undefined }[]>([])

    useEffect(() => {
        const options = possibleAssigneesDetails.map(personDetails => ({
            id: personDetails.azureId,
            title: personDetails.name,
        }))
        setAssigneesOptions(options)
    }, [possibleAssigneesDetails])

    const createdDateString = new Date(action.createDate).toLocaleDateString()

    const checkAndUpdateValidity = () => {
        const isTitleValid = checkIfTitleValid(title)
        // const isParticipantValid = checkIfParticipantValid(assignedTo)
        if (!isTitleValid) {
            if (!isTitleValid) {
                setTitleValidity('error')
            }
            return false
        }
        return true
    }

    useEffect(() => {
        const foundAssignee = possibleAssignees.find(a => a.azureUniqueId === assignedToId)
        setAssignedTo(foundAssignee)
    }, [assignedToId, possibleAssignees])

    // If user assigned is not in the list of possible assignees, create a new participant
    useEffect(() => {
        console.log('useEffect assignedToId', assignedToId)
        const evaluation = possibleAssignees[0].evaluation
        console.log('useEffect evaluation', evaluation)
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

    useEffectNotOnMount(() => {
        const isValid = checkAndUpdateValidity()
        console.log('useEffectNotOnMount assignedTo', assignedTo)
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
        console.log('useEffectNotOnMount assignedTo', assignedTo)
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
        updateValidity(checkIfTitleValid(title), titleValidity, setTitleValidity)
    }, [title, titleValidity])

    useEffect(() => {
        updateValidity(checkIfParticipantValid(assignedTo), assignedToValidity, setAssignedToValidity)
    }, [assignedTo])

    useEffect(() => {
        if (action.completed && completeActionViewOpen) {
            createClosingRemark(completingReason)
        }
    }, [action.completed])

    useEffect(() => {
        if (apiErrorAction !== undefined && completeActionViewOpen) {
            setCompleteActionViewOpen(false)
            setCompleted(false)
        }
    }, [apiErrorAction])

    useEffect(() => {
        if (isClosingRemarkSaved && completeActionViewOpen && !apiErrorClosingRemark) {
            setCompletingReason('')
            setCompleteActionViewOpen(false)
        }
    }, [isClosingRemarkSaved])

    const addLink = () => {
        setCompletingReason(completingReason + '[text](url)')
    }

    const onAssigneeSelected = (e: PersonSelectEvent) => {
        const selectedPersonId = e.nativeEvent.detail.selected?.azureId
        console.log('detail selected', e.nativeEvent.detail.selected)
        setAssignedToId(selectedPersonId)
    }

    return (
        <>
            <Grid container spacing={3}>
                {showErrorMessage && (
                    <ErrorBanner message={'Could not update action. ' + genericErrorMessage} onClose={() => setShowErrorMessage(false)} />
                )}
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
                        disabled={disableEditAction}
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
                    {/* <SearchableDropdown
                        label="Assignee"
                        options={assigneesOptions}
                        value={assigneesOptions.find(option => option.id === assignedToId)?.title}
                        onSelect={(option) => {
                            const selectedOption = (option as any).nativeEvent.detail.selected[0]
                            setAssignedToId(selectedOption.id)
                        }}
                        searchQuery={async (searchTerm: string) => {
                            return assigneesOptions.filter(option => option.title!.toLowerCase().includes(searchTerm.toLowerCase()))
                        } }
                    /> */}
                </Grid>
                <Grid item xs={6}>
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
                <Grid item xs={6}>
                    <NativeSelect
                        label="Priority"
                        id="priority-select"
                        disabled={disableEditAction}
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
                        disabled={disableEditAction}
                    />
                </Grid>
                {!completed && (
                    <Grid item xs={12}>
                        <Button
                            style={{ float: 'right' }}
                            onClick={() => {
                                setCompleteActionViewOpen(true)
                                setCompletingReason('')
                            }}
                            disabled={completeActionViewOpen || disableEditAction}
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
                        <Grid item xs={12} style={{ position: 'relative' }}>
                            <LinkIcon data={link} onClick={addLink} />
                            <TextField
                                id="completed-reason"
                                value={completingReason}
                                autoFocus={true}
                                label={'Reason for closing action (mandatory)'}
                                onChange={(event: TextFieldChangeEvent) => {
                                    setCompletingReason(event.target.value)
                                }}
                            />
                        </Grid>
                        {showClosingNoteErrorMessage && (
                            <Grid item xs={12}>
                                <ErrorBanner
                                    message={
                                        'Unfortunately, we were not able to create a closing note when completing the action. Try again, or write your closing note as a regular note below.'
                                    }
                                    onClose={() => setShowClosingNoteErrorMessage(false)}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <div style={{ float: 'right' }}>
                                <Button
                                    variant="outlined"
                                    style={{ marginRight: '10px' }}
                                    onClick={() => setCompleteActionViewOpen(false)}
                                    data-testid="complete_action_cancel_button"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    data-testid="complete_action_confirm_button"
                                    onClick={() => {
                                        if (!apiErrorClosingRemark) {
                                            setCompleted(true)
                                        } else {
                                            createClosingRemark(completingReason)
                                        }
                                    }}
                                    disabled={completingReason === ''}
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
