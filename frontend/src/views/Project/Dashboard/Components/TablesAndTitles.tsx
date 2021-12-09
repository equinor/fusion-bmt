import { Accordion } from '@equinor/eds-core-react'
import { EvaluationsByProjectMaster } from '../../../../utils/hooks'
import EvaluationsTable from './EvaluationsTable'

interface Props {
    evaluationsWithProjectMasterTitle: EvaluationsByProjectMaster
}

const TablesAndTitles = ({ evaluationsWithProjectMasterTitle }: Props) => {
    return (
        <>
            <Accordion headerLevel="h2">
                {Object.entries(evaluationsWithProjectMasterTitle).map(([projectMasterTitle, evaluations], index) => {
                    return (
                        <Accordion.Item key={index}>
                            <Accordion.Header>{projectMasterTitle}</Accordion.Header>
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
