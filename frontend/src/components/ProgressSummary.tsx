
import React from 'react'
import { Evaluation, Organization, Participant, Question, Progression, Role } from '../api/models'
import ParticipantCard from './ParticipantCard'
import { DataTableColumn, DataTable } from '@equinor/fusion-components'
import { progressionLessThan, ProgressionStatus } from '../utils/ProgressionStatus'
import { getFilledUserAnswersForProgression } from '../utils/QuestionAndAnswerUtils'
import { organizationToString } from '../utils/EnumToString'

interface DataTableItem {
    organization: Organization
    participant: Participant
    progressOrg: number
    progressAll: number
    completed: boolean
    rowIdentifier: string
}

interface DataTableRowProps {
    item: DataTableItem
    rowIndex: number
}

const ParticipantCardRenderer: React.FC<DataTableRowProps> = ({ item }) => (
    <ParticipantCard participant={item.participant} />
)

const ProgressOrganisationRenderer: React.FC<DataTableRowProps> = ({ item }) => {
    return (
        <>{item.progressOrg}%</>
    )
}

const ProgressAllRenderer: React.FC<DataTableRowProps> = ({ item }) => {
    return (
        <>{item.progressAll}%</>
    )
}

const OrganizationRenderer: React.FC<DataTableRowProps> = ({ item }) => {
    return (
        <>{organizationToString(item.organization)}</>
    )
}

const CompletedRenderer: React.FC<DataTableRowProps> = ({ item }) => {
    return (
        <>{item.completed ? "Yes" : "No"}</>
    )
}

const columns: DataTableColumn<DataTableItem>[] = [
    {
        key: 'person',
        accessor: 'participant',
        label: 'Details',
        sortable: false,
        component: ParticipantCardRenderer
    },
    {
        key: 'organization',
        accessor: 'organization',
        label: 'Organization',
        sortable: false,
        component: OrganizationRenderer
    },
    {
        key: 'progressOrg',
        accessor: 'organization',
        label: 'Progress organisation questions',
        sortable: false,
        component: ProgressOrganisationRenderer
    },
    {
        key: 'progressAll',
        accessor: 'organization',
        label: 'Progress all questions',
        sortable: false,
        component: ProgressAllRenderer
    },
    {
        key: 'completed',
        accessor: 'completed',
        label: 'Completed',
        sortable: false,
        component: CompletedRenderer
    },
]

interface ProgressSummaryProps {
    evaluation: Evaluation
    viewProgression: Progression
    allowedRoles: Role[]
}

const getProgressOrganisation = (participant: Participant, questions: Question[], progression: Progression) => {
    if (participant.organization === Organization.All) {
        return getProgressAll(participant, questions, progression)
    }

    const orgQuestions = questions.filter(q => q.organization === participant.organization)
    const filledAnswers = getFilledUserAnswersForProgression(orgQuestions, progression, participant.azureUniqueId)
    return Math.floor((filledAnswers.length / orgQuestions.length) * 100)
}

const getProgressAll = (participant: Participant, questions: Question[], progression: Progression) => {
    const filledAnswers = getFilledUserAnswersForProgression(questions, progression, participant.azureUniqueId)
    return Math.floor((filledAnswers.length / questions.length) * 100)
}

const ProgressSummary = ({evaluation, viewProgression, allowedRoles}: ProgressSummaryProps) => {
    const questions = evaluation.questions

    const data: DataTableItem[] = evaluation.participants
        .filter(participant => allowedRoles.includes(participant.role))
        .map(participant => {
            const isParticipantCompleted = progressionLessThan(viewProgression, participant.progression)
            return {
                participant,
                organization: participant.organization,
                role: participant.role,
                progressionStatus: ProgressionStatus.Awaiting,
                rowIdentifier: participant.id,
                progressOrg: getProgressOrganisation(participant, questions, viewProgression),
                progressAll: getProgressAll(participant, questions, viewProgression),
                completed: isParticipantCompleted
            }
        })

    return <>
        <DataTable
            columns={columns}
            data={data}
            isFetching={false}
            rowIdentifier={'rowIdentifier'}
        />
    </>
}

export default ProgressSummary
