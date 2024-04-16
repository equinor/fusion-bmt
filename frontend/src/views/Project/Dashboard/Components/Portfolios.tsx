import React, { useEffect, useRef } from 'react'
import { EvaluationsByProjectMasterAndPortfolio } from '../../../../utils/hooks'
import { Accordion } from '@equinor/eds-core-react'
import TablesAndTitles from './TablesAndTitles'
import { ApolloQueryResult } from '@apollo/client'
import { Evaluation } from '../../../../api/models'

interface Props {
    evaluationsWithProjectMasterAndPortfolio: EvaluationsByProjectMasterAndPortfolio
    generatedBMTScores: any
    refetchActiveEvaluations: (() => Promise<ApolloQueryResult<{evaluations: Evaluation[]}>>) | undefined
}

const Portfolios = ({
    evaluationsWithProjectMasterAndPortfolio,
    generatedBMTScores,
    refetchActiveEvaluations,
}: Props) => {
    const renderCount = useRef(0);

    useEffect(() => {
        renderCount.current = renderCount.current + 1;
        console.log(`Portfolios.tsx has rendered ${renderCount.current} times`);
    })

    return (
        <>
            <Accordion headerLevel="h3">
                {Object.entries(evaluationsWithProjectMasterAndPortfolio)
                    .reverse()
                    .map(([portfolio, evaluationsWithProjectMasterTitle], index) => {
                        return (
                            <Accordion.Item key={index} isExpanded>
                                <Accordion.Header>{portfolio}</Accordion.Header>
                                <Accordion.Panel>
                                    <TablesAndTitles
                                        evaluationsWithProjectMasterTitle={evaluationsWithProjectMasterTitle}
                                        generatedBMTScores={generatedBMTScores}
                                        refetchActiveEvaluations={refetchActiveEvaluations}
                                    />
                                </Accordion.Panel>
                            </Accordion.Item>
                        )
                    })}
            </Accordion>
        </>
    )
}

export default Portfolios
