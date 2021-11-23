import React from 'react'
import { EvaluationsWithPortfolio } from '../../../utils/hooks'
import { Accordion } from '@equinor/eds-core-react'
import TablesAndTitles from './TablesAndTitles'

interface Props {
    evaluationsWithPortfolio: EvaluationsWithPortfolio
}

type portfolioAndProjectMasterTitle = {
    portfolio: string
    projectMasterTitle: string
}

const Portfolios = ({ evaluationsWithPortfolio }: Props) => {
    const [portfolioAndProjectMasterTitles, setPortfolioAndProjectMasterTitles] = React.useState<portfolioAndProjectMasterTitle[]>([
        {
            portfolio: '',
            projectMasterTitle: '',
        },
    ])

    React.useEffect(() => {
        const uniqueProjectMasterTitlesWithPortfolio: portfolioAndProjectMasterTitle[] = []
        Object.entries(evaluationsWithPortfolio)
            .reverse()
            .map(([portfolio, evaluationsWithProjectMasterTitle]) => {
                evaluationsWithProjectMasterTitle.forEach(e => {
                    if (!uniqueProjectMasterTitlesWithPortfolio.map(a => a.projectMasterTitle).includes(e.projectMasterTitle)) {
                        uniqueProjectMasterTitlesWithPortfolio.push({
                            portfolio,
                            projectMasterTitle: e.projectMasterTitle,
                        })
                    }
                })
            })
        setPortfolioAndProjectMasterTitles(uniqueProjectMasterTitlesWithPortfolio)
    }, [evaluationsWithPortfolio])

    return (
        <>
            <Accordion headerLevel="h3">
                {Object.entries(evaluationsWithPortfolio)
                    .reverse()
                    .map(([portfolio, evaluationsWithProjectMasterTitle], index) => {
                        return (
                            <Accordion.Item key={index}>
                                <Accordion.Header>{portfolio}</Accordion.Header>
                                <Accordion.Panel>
                                    <TablesAndTitles
                                        evaluationsWithProjectMasterTitle={evaluationsWithProjectMasterTitle}
                                        projectMasterTitles={portfolioAndProjectMasterTitles
                                            .filter(a => a.portfolio === portfolio)
                                            .map(a => a.projectMasterTitle)}
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
