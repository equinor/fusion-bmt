import { Accordion } from '@equinor/eds-core-react'
import { EvaluationsByProjectMaster } from '../../../../utils/hooks'
import EvaluationsTable from './EvaluationsTable'
import { useProject } from '../../../../globals/contexts'
import { useEffect } from 'react'
import EvaluationScoreIndicator from '../../../../components/EvaluationScoreIndicator'
import FollowUpIndicator from '../../../../components/FollowUpIndicator'
import { noProjectMasterTitle } from '../../../../utils/hooks'
import styled from 'styled-components'

const Indicators = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`
interface Props {
    evaluationsWithProjectMasterTitle: EvaluationsByProjectMaster
    generatedBMTScores: any
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
                    let projectId = ""
                    let followUpScore = null
                    Object.entries(evaluations).map((info) => {

                        if (info[1].projectId !== projectId) {
                            projectId = info[1].projectId
                        }

                        if (info[1].project.indicatorEvaluationId === info[1].id) {
                            if (info[1].indicatorActivityDate) {
                                activityDate = info[1].indicatorActivityDate
                            }
                        }
                    })
                    if (generatedBMTScores) {
                        generatedBMTScores.generateBMTScores.forEach((score: any, index: any) => {
                            if (score.projectId === projectId) {
                                followUpScore = score.followUpScore
                            }
                        })
                    }

                    return (
                        <Accordion.Item key={index}>
                            <Accordion.Header>
                                <Indicators>
                                    {projectMasterTitle}
                                    <FollowUpIndicator value={followUpScore} />
                                    <EvaluationScoreIndicator date={activityDate} />
                                </Indicators>
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
