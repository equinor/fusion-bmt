import React from 'react'
import { EvaluationsWithPortfolio } from '../../../utils/hooks'
import { Accordion } from '@equinor/eds-core-react'
import EvaluationsTable from './EvaluationsTable'

interface Props {
    evaluationsWithPortfolio: EvaluationsWithPortfolio
}

const Portfolios = ({ evaluationsWithPortfolio }: Props) => {
    return (
        <>
            <Accordion headerLevel="h3">
                {Object.entries(evaluationsWithPortfolio)
                    .reverse()
                    .map(([portfolio, evaluations], index) => {
                        return (
                            <Accordion.Item key={index}>
                                <Accordion.Header>{portfolio}</Accordion.Header>
                                <Accordion.Panel>
                                    <EvaluationsTable evaluations={evaluations} />
                                </Accordion.Panel>
                            </Accordion.Item>
                        )
                    })}
            </Accordion>
        </>
    )
}

export default Portfolios
