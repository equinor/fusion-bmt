import { Accordion } from '@equinor/eds-core-react'
import { EvaluationsByProjectMaster } from '../../../../utils/hooks'
import EvaluationsTable from './EvaluationsTable'
import { useProject } from '../../../../globals/contexts'
import { useEffect } from 'react'
import EvaluationScoreIndicator from '../../../../components/EvaluationScoreIndicator'

interface Props {
    evaluationsWithProjectMasterTitle: EvaluationsByProjectMaster
}

const TablesAndTitles = ({ evaluationsWithProjectMasterTitle }: Props) => {
    const project = useProject()

    useEffect(() => {
        console.log(evaluationsWithProjectMasterTitle)
    }, [evaluationsWithProjectMasterTitle])

    return (
        <>
            <Accordion headerLevel="h2">
                {Object.entries(evaluationsWithProjectMasterTitle).map(([projectMasterTitle, evaluations], index) => {
                    return (
                        <Accordion.Item key={index}>
                            <Accordion.Header>
                                {projectMasterTitle}
                                <EvaluationScoreIndicator date="2024-02-10T13:04:28.478Z" />
                                <EvaluationScoreIndicator date="2024-03-10T13:04:28.478Z" />
                                <EvaluationScoreIndicator date="2024-04-10T13:04:28.478Z" />
                            </Accordion.Header>
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

export default TablesAndTitles
