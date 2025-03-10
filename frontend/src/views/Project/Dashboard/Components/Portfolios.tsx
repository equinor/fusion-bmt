import { EvaluationsByProjectMasterAndPortfolio } from '../../../../utils/hooks'
import { Accordion } from '@equinor/eds-core-react'
import TablesAndTitles from './TablesAndTitles'

interface Props {
    evaluationsWithProjectMasterAndPortfolio: EvaluationsByProjectMasterAndPortfolio
    generatedBMTScores: any
}

const Portfolios = ({
    evaluationsWithProjectMasterAndPortfolio,
    generatedBMTScores,
}: Props) => {
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
