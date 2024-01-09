import React from 'react'
import { Evaluation, Organization, Participant, Question, Progression, Role } from '../api/models'
import ParticipantCard from './ParticipantCard'
import { Table } from '@equinor/eds-core-react'
import { progressionLessThan, ProgressionStatus } from '../utils/ProgressionStatus'
import { getFilledUserAnswersForProgression } from '../utils/QuestionAndAnswerUtils'
import { organizationToString } from '../utils/EnumToString'
import styled from 'styled-components'

const StyledTable = styled(Table)`
    width: 100%;
`

interface DataTableItem {
    organization: Organization
    participant: Participant
    progressOrg: number
    progressAll: number
    completed: boolean
    rowIdentifier: string
}

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

const ProgressSummary = ({ evaluation, viewProgression, allowedRoles }: ProgressSummaryProps) => {
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
                completed: isParticipantCompleted,
            }
        })

    return (
        <StyledTable>
            <Table.Head>
                <Table.Row>
                    <Table.Cell>Details</Table.Cell>
                    <Table.Cell>Organization</Table.Cell>
                    <Table.Cell>Progress organisation questions</Table.Cell>
                    <Table.Cell>Progress all questions</Table.Cell>
                    <Table.Cell>Completed</Table.Cell>
                </Table.Row>
            </Table.Head>
            <Table.Body>
                {data.map((item, index) => (
                    <Table.Row key={index}>
                        <Table.Cell>
                            <ParticipantCard participant={item.participant} />
                        </Table.Cell>
                        <Table.Cell>{organizationToString(item.organization)}</Table.Cell>
                        <Table.Cell>{item.progressOrg}%</Table.Cell>
                        <Table.Cell>{item.progressAll}%</Table.Cell>
                        <Table.Cell>{item.completed ? 'Yes' : 'No'}</Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </StyledTable>
    )
}

export default ProgressSummary
