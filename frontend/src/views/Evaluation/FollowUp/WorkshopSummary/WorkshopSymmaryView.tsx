import React from 'react'

import { Box } from '@material-ui/core'
import { Table, Typography } from '@equinor/eds-core-react'

import { Barrier, Evaluation, Progression } from '../../../../api/models'
import SeveritySummary from '../../../../components/SeveritySummary'
import { countSeverities } from '../../../../utils/Severity'
import { barrierToString } from '../../../../utils/EnumToString'

const { Body, Row, Cell } = Table

interface Props {
    evaluation: Evaluation
}

const WorkshopSummaryView = ({ evaluation }: Props) => {
    const questions = evaluation.questions
    return (
        <>
            <Box p="20px">
                <Typography variant="h2">List view</Typography>
                <Table>
                    <Body>
                        {Object.values(Barrier).map(barrier => {
                            const followUpBarrierAnswers = questions
                                .filter(q => q.barrier === barrier)
                                .map(q => {
                                    const answers = q.answers.filter(a => a.progression === Progression.Workshop)
                                    const length = answers.length
                                    if (length === 0) {
                                        return null
                                    }
                                    return answers[0]
                                })
                            return (
                                <Row key={barrier}>
                                    <Cell>{barrier}</Cell>
                                    <Cell>{barrierToString(barrier)}</Cell>
                                    <Cell>
                                        <SeveritySummary severityCount={countSeverities(followUpBarrierAnswers)} />
                                    </Cell>
                                </Row>
                            )
                        })}
                    </Body>
                </Table>
            </Box>
        </>
    )
}

export default WorkshopSummaryView
