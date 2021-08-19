import React from 'react'

import { Box } from '@material-ui/core'
import { Button, TextArea } from '@equinor/fusion-components'

import AddNomineeDialog from './AddNomineeDialog'
import { Evaluation, Organization, Participant, Progression, Role } from '../../../api/models'
import NominationTable from './NominationTable'
import { useCreateParticipantMutation, useParticipantsQuery } from './NominationGQL'
import { participantCanProgressEvaluation } from '../../../utils/RoleBasedAccess'
import { useAzureUniqueId } from '../../../utils/Variables'

interface NominationViewProps {
    evaluation: Evaluation
    onNextStep: () => void
}

/** Who (Role) can progress Evaluation past Nomination, and when
 *
 * Who:
 *  Facilitators and OrganizationLeads
 *
 * When:
 *  Evaluation is at Nomination stage
 */
const disableProgression = (evaluation: Evaluation, azureUniqueId: string) => {
    if (evaluation.progression !== Progression.Nomination) {
        return true
    }

    const loggedInUser = evaluation.participants.find(p => p.azureUniqueId === azureUniqueId)

    if (!loggedInUser) {
        return true
    }

    return !participantCanProgressEvaluation(loggedInUser.role)
}

const NominationView = ({ evaluation, onNextStep }: NominationViewProps) => {
    const [panelOpen, setPanelOpen] = React.useState(false)
    const { createParticipant, error: errorMutation } = useCreateParticipantMutation()
    const { loading: loadingQuery, participants, error: errorQuery } = useParticipantsQuery(evaluation.id)

    const onNextStepClick = () => {
        onNextStep()
    }

    const onNomineeSelected = (azureUniqueId: string, role: Role, organization: Organization) => {
        createParticipant(azureUniqueId, evaluation.id, organization, role)
    }

    if (loadingQuery) {
        return <>Loading...</>
    }

    if (errorMutation !== undefined) {
        return (
            <div>
                <TextArea value={`Error in creating participant: ${JSON.stringify(errorMutation)}`} onChange={() => {}} />
            </div>
        )
    }
    if (errorQuery !== undefined) {
        return (
            <div>
                <TextArea value={`Error in loading participants: ${JSON.stringify(errorQuery)}`} onChange={() => {}} />
            </div>
        )
    }
    if (participants === undefined) {
        return (
            <div>
                <TextArea value={`Error in loading participants(undefined): ${JSON.stringify(participants)}`} onChange={() => {}} />
            </div>
        )
    }

    return (
        <div style={{ margin: 20 }}>
            <Box display="flex" flexDirection="row">
                <Box flexGrow={1}>
                    <h2 data-testid="evaluation_title">{evaluation.name}</h2>
                </Box>
                <Box>
                    <Button onClick={onNextStepClick} disabled={disableProgression(evaluation, useAzureUniqueId())}>
                        Finish Nomination
                    </Button>
                </Box>
            </Box>

            <Button
                onClick={() => {
                    setPanelOpen(true)
                }}
            >
                Add Person
            </Button>

            <NominationTable
                participants={participants}
            />

            <AddNomineeDialog
                open={panelOpen}
                onCloseClick={() => setPanelOpen(false)}
                onNomineeSelected={onNomineeSelected}
                currentNominees={participants}
            />
        </div>
    )
}

export default NominationView
