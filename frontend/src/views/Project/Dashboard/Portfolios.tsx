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
                    .sort((a, b) => {
                        if (a[0] > b[0]) {
                            return 1
                        }
                        if (a[0] < b[0]) {
                            return -1
                        }
                        return 0
                    })
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
