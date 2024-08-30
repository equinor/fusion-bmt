import React, { useState } from 'react'
import { ApolloError, gql, useMutation, useQuery } from '@apollo/client'
import { Grid } from '@mui/material'
import ErrorMessage from '../../../components/ErrorMessage'
import { Button, CircularProgress, Icon, Snackbar, Tooltip } from '@equinor/eds-core-react'
import { visibility, visibility_off } from '@equinor/eds-icons'
import SearchableDropdown from '../../../components/SearchableDropDown'
import AddNomineeDialog from './components/AddNomineeDialog'
import { Evaluation, Organization, Participant, Progression, Project, Role, Status } from '../../../api/models'
import NominationTable from './components/NominationTable'
import {
    participantCanAddParticipant,
    participantCanHideEvaluation,
    participantCanProgressEvaluation,
} from '../../../utils/RoleBasedAccess'
import { EVALUATION_FIELDS_FRAGMENT, PARTICIPANT_FIELDS_FRAGMENT } from '../../../api/fragments'
import { useParticipant } from '../../../globals/contexts'
import { disableProgression } from '../../../utils/disableComponents'
import SaveIndicator from '../../../components/SaveIndicator'
import { genericErrorMessage, SavingState } from '../../../utils/Variables'
import { useEffectNotOnMount, useShowErrorHook } from '../../../utils/hooks'
import { centered } from '../../../utils/styles'
import ErrorBanner from '../../../components/ErrorBanner'
import { getCachedRoles } from '../../../utils/helpers'
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks'
import { useAppContext } from '../../../context/AppContext'

interface NominationViewProps {
    evaluation: Evaluation
    onNextStep: () => void
}

export const createDropdownOptionsFromProjects = (
    list: any, // Context[]
    selectedOption: string,
    hasFetched: boolean
) => {
    if (!hasFetched) {
        return [
            {
                title: 'Loading...',
                id: 'loading',
            },
        ]
    }
    // if (list.length === 0) {
    //     return [
    //         {
    //             title: 'No projects found',
    //             id: 'empty',
    //         },
    //     ]
    // }
    // console.log("list", list)
    // return list.map((item, index) => ({
    //     title: item.title,
    //     id: item.id,
    //     externalId: item.externalId,
    // }))
    return [
        {
            title: list.title,
            id: list.id,
            externalId: list.externalId,
        },
    ]
}

interface SetEvaluationToAnotherProjectMutationProps {
    setEvaluationToAnotherProject: (
        evaluationId: string,
        destinationProjectFusionId: string,
        destinationProjectExternalId: string | null | undefined
    ) => void
    loading: boolean
    error: ApolloError | undefined
}

const useSetEvaluationToAnotherProjectMutation = (): SetEvaluationToAnotherProjectMutationProps => {
    const SET_EVALUATION_TO_ANOTHER_PROJECT = gql`
        mutation setEvaluationToAnotherProject(
            $evaluationId: String!
            $destinationProjectFusionId: String!
            $destinationProjectExternalId: String
        ) {
            setEvaluationToAnotherProject(
                evaluationId: $evaluationId
                destinationProjectFusionId: $destinationProjectFusionId
                destinationProjectExternalId: $destinationProjectExternalId
            ) {
                id
            }
        }
    `

    const [setEvaluationToAnotherProjectApolloFunc, { loading, data, error }] = useMutation(SET_EVALUATION_TO_ANOTHER_PROJECT)

    const setEvaluationToAnotherProject = (
        evaluationId: string,
        destinationProjectFusionId: string,
        destinationProjectExternalId: string | null | undefined
    ) => {
        setEvaluationToAnotherProjectApolloFunc({
            variables: { evaluationId, destinationProjectFusionId, destinationProjectExternalId },
        })
    }

    return {
        setEvaluationToAnotherProject,
        loading,
        error,
    }
}

const NominationView = ({ evaluation, onNextStep }: NominationViewProps) => {
    const currentUser = useCurrentUser()
    const participant = useParticipant()

    const {
        setEvaluationToAnotherProject,
        loading: setEvaluationToAnotherProjectLoading,
        error: setEvaluationToAnotherProjectError,
    } = useSetEvaluationToAnotherProjectMutation()

    const { createParticipant, loading: createParticipantLoading, error: errorCreateParticipant } = useCreateParticipantMutation()
    const { loading: loadingQuery, participants, error: errorQuery } = useParticipantsQuery(evaluation.id)
    const { setEvaluationStatus, loading, error } = useSetEvaluationStatusMutation()

    const [panelOpen, setPanelOpen] = React.useState(false)
    const [statusSavingState, setStatusSavingState] = React.useState(SavingState.None)
    const { showErrorMessage, setShowErrorMessage } = useShowErrorHook(error)

    const viewProgression = Progression.Nomination
    const isAdmin = currentUser && getCachedRoles()?.includes('Role.Admin')

    const { isFetchingProjects, projects, currentProject, setCurrentProject, projectOptions } = useAppContext()
    const [switchProject, setSwitchProject] = useState<boolean>(false)

    useEffectNotOnMount(() => {
        if (loading) {
            setStatusSavingState(SavingState.Saving)
        } else if (!loading && !error) {
            setStatusSavingState(SavingState.Saved)

            setTimeout(() => {
                setStatusSavingState(SavingState.None)
            }, 2000)
        }
    }, [loading])

    useEffectNotOnMount(() => {
        if (error) {
            setStatusSavingState(SavingState.NotSaved)
        }
    }, [error])

    const onNextStepClick = () => {
        onNextStep()
    }

    const onNomineeSelected = (azureUniqueId: string, role: Role, organization: Organization) => {
        createParticipant(azureUniqueId, evaluation.id, organization, role)
    }

    if (loadingQuery) {
        return (
            <div style={centered}>
                <CircularProgress />
            </div>
        )
    }

    if (errorQuery !== undefined || participants === undefined) {
        return <ErrorMessage title="Could not load participants" message={genericErrorMessage} />
    }

    if (errorCreateParticipant !== undefined) {
        return <ErrorMessage title="Could not add participant" message={genericErrorMessage} />
    }

    const updateEvaluationToNewProject = (project: Project) => {
        setEvaluationToAnotherProject(evaluation.id, project.fusionProjectId, project.externalId)

        if (process.env.IS_DEVELOPMENT === 'true') {
            window.location.pathname = `${project.id}/evaluation/${evaluation.id}`
        } else {
            window.location.pathname = `apps/bmt/${project.fusionProjectId}/evaluation/${evaluation.id}`
        }
    }

    const toggleStatus = () => {
        const newStatus = evaluation.status === Status.Voided ? Status.Active : Status.Voided
        setEvaluationStatus(evaluation.id, newStatus)
    }

    const isVisible = evaluation.status !== Status.Voided

    return (
        <Grid container gap={2} sx={{ marginTop: '10px' }}>
            <Grid item xs={0} container gap={1} alignItems="flex-end" justifyContent="space-between">
                <Grid item xs={0}>
                    <Button
                        onClick={() => {
                            setPanelOpen(true)
                        }}
                        disabled={!participantCanAddParticipant(participant)}
                    >
                        Add Person
                    </Button>
                </Grid>
                {(participantCanHideEvaluation(participant) || isAdmin) && (
                    <Grid item xs container gap={1} alignItems="center" justifyContent="flex-end">
                        <Grid item xs={0}>
                            <Tooltip title={`This evaluation is currently ${isVisible ? 'visible' : 'hidden'} in the list`}>
                                <Button
                                    variant="ghost"
                                    onClick={toggleStatus}
                                    disabled={!(participantCanHideEvaluation(participant) || isAdmin)}
                                >
                                    <Icon data={isVisible ? visibility : visibility_off}></Icon>
                                    {isVisible ? 'Hide from list' : 'Make visible'}
                                </Button>
                            </Tooltip>
                        </Grid>
                        <Grid item xs container gap={1} justifyContent="flex-end" alignItems="flex-end">
                            {isFetchingProjects ? (
                                <CircularProgress />
                            ) : (
                                <>
                                    {switchProject && (
                                        <SearchableDropdown
                                            label=""
                                            value={currentProject?.title}
                                            onSelect={(option: any) => {
                                                const selectedProject = projects.filter(
                                                    project => project.externalId === option.nativeEvent.detail.selected[0].id
                                                )[0]
                                                setCurrentProject(selectedProject)
                                                updateEvaluationToNewProject(selectedProject)
                                                setSwitchProject(false)
                                            }}
                                            options={projectOptions}
                                            searchQuery={async (searchTerm: string) => {
                                                return projectOptions.filter(projectOption =>
                                                    projectOption.title!.toLowerCase().includes(searchTerm.toLowerCase())
                                                )
                                            }}
                                            variant="page-dense"
                                            onReset={() => setSwitchProject(false)}
                                        />
                                    )}
                                    <Button onClick={() => setSwitchProject(!switchProject)} variant="outlined">
                                        {switchProject ? "Keep project" : "Switch project"}
                                    </Button>
                                </>
                            )}
                        </Grid>
                        {participantCanProgressEvaluation(participant) && (
                            <Grid item xs={0}>
                                <Button
                                    onClick={onNextStepClick}
                                    disabled={
                                        statusSavingState !== SavingState.None ||
                                        disableProgression(evaluation, participant, viewProgression)
                                    }
                                >
                                    {statusSavingState === SavingState.None ? (
                                        'Finish Nomination'
                                    ) : (
                                        <SaveIndicator savingState={statusSavingState} />
                                    )}
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Grid>
            <Grid item xs={12}>
                <NominationTable participants={participants} />
            </Grid>
            <AddNomineeDialog
                open={panelOpen}
                onCloseClick={() => setPanelOpen(false)}
                onNomineeSelected={onNomineeSelected}
                currentNominees={participants}
                createParticipantLoading={createParticipantLoading}
            />
            <Snackbar 
                open={showErrorMessage}
                placement="top"
                onClose={() => setShowErrorMessage(false)}
                >
                <ErrorBanner
                    message={'Could not change evaluation state. ' + genericErrorMessage}
                    onClose={() => setShowErrorMessage(false)}
                />
            </Snackbar>
        </Grid>
    )
}

export default NominationView

interface CreateParticipantMutationProps {
    createParticipant: (azureUniqueId: string, evaluationId: string, organization: Organization, role: Role) => void
    loading: boolean
    participant: Participant | undefined
    error: ApolloError | undefined
}

const useCreateParticipantMutation = (): CreateParticipantMutationProps => {
    const CREATE_PARTICIPANT = gql`
        mutation CreateParticipant($azureUniqueId: String!, $evaluationId: String!, $organization: Organization!, $role: Role!) {
            createParticipant(azureUniqueId: $azureUniqueId, evaluationId: $evaluationId, organization: $organization, role: $role) {
                ...ParticipantFields
            }
        }
        ${PARTICIPANT_FIELDS_FRAGMENT}
    `

    const [createParticipantApolloFunc, { loading, data, error }] = useMutation(CREATE_PARTICIPANT, {
        update(cache, { data: { createParticipant } }) {
            cache.modify({
                fields: {
                    participants(existingParticipants = []) {
                        const newParticipantRef = cache.writeFragment({
                            id: createParticipant.id,
                            data: createParticipant,
                            fragment: PARTICIPANT_FIELDS_FRAGMENT,
                        })
                        return [...existingParticipants, newParticipantRef]
                    },
                },
            })
        },
    })

    const createParticipant = (azureUniqueId: string, evaluationId: string, organization: Organization, role: Role) => {
        createParticipantApolloFunc({ variables: { azureUniqueId, evaluationId, organization, role } })
    }

    return {
        createParticipant: createParticipant,
        loading,
        participant: data?.createParticipant,
        error,
    }
}

interface ParticipantQueryProps {
    loading: boolean
    participants: Participant[] | undefined
    error: ApolloError | undefined
}

const useParticipantsQuery = (evaluationId: string): ParticipantQueryProps => {
    const GET_PARTICIPANTS = gql`
        query {
            participants(where:{evaluation: {id: {eq: "${evaluationId}"}}}) {
                ...ParticipantFields
            }
        }
        ${PARTICIPANT_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{ participants: Participant[] }>(GET_PARTICIPANTS)

    return {
        loading,
        participants: data?.participants,
        error,
    }
}

interface setEvaluationStatusMutationProps {
    setEvaluationStatus: (evaluationId: string, newStatus: Status) => Promise<void>
    loading: boolean
    error: ApolloError | undefined
}

export const useSetEvaluationStatusMutation = (): setEvaluationStatusMutationProps => {
    const SET_EVALUATION_STATUS_MUTATION = gql`
        mutation SetEvaluationStatus($evaluationId: String!, $newStatus: Status!) {
            setEvaluationStatus(evaluationId: $evaluationId, newStatus: $newStatus) {
                ...EvaluationFields
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
    `

    const [setEvaluationStatusApolloFunc, { loading, data, error }] = useMutation(SET_EVALUATION_STATUS_MUTATION)

    const setEvaluationStatus = async (evaluationId: string, newStatus: Status) => {
        await setEvaluationStatusApolloFunc({ variables: { evaluationId, newStatus } })
    }

    return {
        setEvaluationStatus,
        loading,
        error,
    }
}
