import React from 'react'
import { Table, Tooltip, Typography } from '@equinor/eds-core-react'
import { Evaluation, Progression } from '../../../api/models'
import ProgressStatusIcon from '../../../components/ProgressStatusIcon'
import { Link } from 'react-router-dom'
import { useProject } from '../../../globals/contexts'
import { progressionToString } from '../../../utils/EnumToString'
import { calcProgressionStatus } from '../../../utils/ProgressionStatus'

const { Body, Row, Cell, Head } = Table

interface Props {
    evaluations: Evaluation[]
}

const EvaluationsTable = ({ evaluations }: Props) => {
    return (
        <>
            <Table style={{ width: '100%' }}>
                <Head>
                    <Row>
                        <Cell>Title</Cell>
                        <Cell>Workflow</Cell>
                    </Row>
                </Head>
                <Body>
                    {evaluations.map((evaluation, index) => {
                        const project = useProject()

                        return (
                            <Row key={index}>
                                <Cell>
                                    <Link to={`${project.fusionProjectId}/evaluation/${evaluation.id}`} style={{ textDecoration: 'none' }}>
                                        <Typography
                                            color="primary"
                                            variant="body_short"
                                            token={{
                                                fontSize: '1.2rem',
                                            }}
                                        >
                                            {evaluation.name}
                                        </Typography>
                                    </Link>
                                </Cell>
                                <Cell>
                                    {Object.values(Progression).map(progression => (
                                        <Tooltip
                                            key={index + progression}
                                            placement="bottom"
                                            title={
                                                progressionToString(progression) +
                                                ' ' +
                                                calcProgressionStatus(evaluation.progression, progression).toLowerCase()
                                            }
                                        >
                                            <ProgressStatusIcon progression={evaluation.progression} compareProgression={progression} />
                                        </Tooltip>
                                    ))}
                                </Cell>
                            </Row>
                        )
                    })}
                </Body>
            </Table>
        </>
    )
}

export default EvaluationsTable
