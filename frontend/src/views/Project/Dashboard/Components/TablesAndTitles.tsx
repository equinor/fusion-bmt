import { Accordion } from '@equinor/eds-core-react'
import { EvaluationsByProjectMaster } from '../../../../utils/hooks'
import EvaluationsTable from './EvaluationsTable'
import EvaluationScoreIndicator from '../../../../components/EvaluationScoreIndicator'
import FollowUpIndicator from '../../../../components/FollowUpIndicator'
import { noProjectMasterTitle } from '../../../../utils/hooks'
import styled from 'styled-components'
import { ApolloQueryResult } from '@apollo/client'
import { Evaluation, Progression } from '../../../../api/models'
import React from 'react'
import { ProjectBMTScore, ProjectIndicator } from '../../../../utils/helperModels'

const Indicators = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`

const StyledPanel = styled(Accordion.Panel)`
    overflow-y: auto;
`

interface Props {
    evaluationsWithProjectMasterTitle: EvaluationsByProjectMaster
    generatedBMTScores: any
    refetchActiveEvaluations: (() => Promise<ApolloQueryResult<{ evaluations: Evaluation[] }>>) | undefined
}

const TablesAndTitles = ({
    evaluationsWithProjectMasterTitle,
    generatedBMTScores,
    refetchActiveEvaluations,
}: Props) => {
    const [projectIndicators, setProjectIndicators] = React.useState<ProjectIndicator[]>([])
    const [projectBMTScores, setProjectBMTScores] = React.useState<ProjectBMTScore[]>([])

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

                    Object.entries(evaluations).forEach((evaluation) => {
                        const evalData = evaluation[1]
                        if (evalData.projectId !== projectId) {
                            projectId = evalData.projectId
                        }

                        const isFollowUp = evalData.progression === Progression.FollowUp
                        const isIndicatorEvaluation = evalData.project.indicatorEvaluationId === evalData.id
                        const isProjectIndicator = projectIndicators.findIndex(pi => pi.evaluationId === evalData.id) > -1

                        if ((isProjectIndicator || isIndicatorEvaluation) && isFollowUp) {
                            if (evalData.indicatorActivityDate) {
                                activityDate = evalData.indicatorActivityDate
                            } else if (evalData.workshopCompleteDate) {
                                activityDate = evalData.workshopCompleteDate
                            }
                        }
                    })
                    if (projectBMTScores.length > 0) {
                        const score = projectBMTScores.find((score: any) => score.projectId === projectId)
                        if (score) {
                            followUpScore = score.bmtScore
                        }
                    } else if (generatedBMTScores) {
                        const score = generatedBMTScores.generateBMTScores.find((score: any) => score.projectId === projectId)
                        if (score) {
                            followUpScore = score.followUpScore
                        }
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
                            <StyledPanel>
                                <EvaluationsTable
                                    evaluations={evaluations}
                                    isInPortfolio={true}
                                    refetchActiveEvaluations={refetchActiveEvaluations}
                                    projectIndicators={projectIndicators}
                                    setProjectIndicators={setProjectIndicators}
                                    projectBMTScores={projectBMTScores}
                                    setProjectBmtScores={setProjectBMTScores}
                                />
                            </StyledPanel>
                        </Accordion.Item>
                    )
                })}
            </Accordion>
        </>
    )
}

export default TablesAndTitles
