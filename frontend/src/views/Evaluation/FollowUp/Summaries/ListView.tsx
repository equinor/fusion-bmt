import React from 'react'

import { Box } from '@material-ui/core'
import { Table, Typography } from '@equinor/eds-core-react'

import SeveritySummary from '../../../../components/SeveritySummary'
import { countSeverities } from '../../../../utils/Severity'
import { barrierToString } from '../../../../utils/EnumToString'
import { AnswersWithBarrier } from '../../../../utils/Variables'

const { Body, Row, Cell } = Table

interface Props {
    answersWithBarrier: AnswersWithBarrier[]
}

const ListView = ({ answersWithBarrier }: Props) => {
    return (
        <>
            <Box p="20px" style={{ marginLeft: '30px' }}>
                <Typography variant="h2" style={{ marginBottom: '20px' }}>
                    List view
                </Typography>
                <Table>
                    <Body>
                        {Object.values(answersWithBarrier).map(({ barrier, answers }) => {
                            return (
                                <Row key={barrier}>
                                    <Cell>{barrier}</Cell>
                                    <Cell>{barrierToString(barrier)}</Cell>
                                    <Cell>
                                        <SeveritySummary severityCount={countSeverities(answers)} />
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

export default ListView
