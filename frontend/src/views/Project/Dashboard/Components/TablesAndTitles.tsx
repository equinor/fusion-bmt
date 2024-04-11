import { Accordion } from '@equinor/eds-core-react'
import { EvaluationsByProjectMaster } from '../../../../utils/hooks'
import EvaluationsTable from './EvaluationsTable'
import { useProject } from '../../../../globals/contexts'
import { useEffect } from 'react'
import EvaluationScoreIndicator from '../../../../components/EvaluationScoreIndicator'
import { noProjectMasterTitle } from '../../../../utils/hooks'

interface Props {
    evaluationsWithProjectMasterTitle: EvaluationsByProjectMaster
    generatedBMTScores: String | undefined
}

const TablesAndTitles = ({ evaluationsWithProjectMasterTitle, generatedBMTScores }: Props) => {
    const project = useProject()



    useEffect(() => {
        console.log(generatedBMTScores)
    }, [generatedBMTScores])

    return (
        <>
            <Accordion headerLevel="h2">
                {Object.entries(evaluationsWithProjectMasterTitle).map(([projectMasterTitle, evaluations], index) => {
                    if (projectMasterTitle === noProjectMasterTitle) {
                        return null
                    }
                    let activityDate = ""
                    Object.entries(evaluations).map((info) => {
                        if (info[1].project.indicatorEvaluationId === info[1].id) {
                            if (info[1].indicatorActivityDate) {
                                activityDate = info[1].indicatorActivityDate
                            }
                        }
                    })

                    return (
                        <Accordion.Item key={index}>
                            <Accordion.Header>
                                {projectMasterTitle}

                                <EvaluationScoreIndicator date={activityDate} />

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
