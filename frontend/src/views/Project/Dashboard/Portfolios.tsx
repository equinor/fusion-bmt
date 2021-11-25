import React from 'react'
import { EvaluationsByProjectMasterAndPortfolio } from '../../../utils/hooks'
import { Accordion } from '@equinor/eds-core-react'
import TablesAndTitles from './TablesAndTitles'

interface Props {
    evaluationsWithProjectMasterAndPortfolio: EvaluationsByProjectMasterAndPortfolio
}

const Portfolios = ({ evaluationsWithProjectMasterAndPortfolio }: Props) => {
    return (
        <>
            <Accordion headerLevel="h3">
                {Object.entries(evaluationsWithProjectMasterAndPortfolio)
                    .reverse()
                    .map(([portfolio, evaluationsWithProjectMasterTitle], index) => {
                        return (
                            <Accordion.Item key={index}>
                                <Accordion.Header>{portfolio}</Accordion.Header>
                                <Accordion.Panel>
                                    <TablesAndTitles evaluationsWithProjectMasterTitle={evaluationsWithProjectMasterTitle} />
                                </Accordion.Panel>
                            </Accordion.Item>
                        )
                    })}
            </Accordion>
        </>
    )
}

export default Portfolios
