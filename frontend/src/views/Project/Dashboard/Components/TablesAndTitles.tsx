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
                        if (evaluation[1].projectId !== projectId) {
                            projectId = evaluation[1].projectId
                        }

                        if (projectIndicators.findIndex(pi => pi.evaluationId === evaluation[1].id) > -1 && evaluation[1].project.indicatorEvaluationId === evaluation[1].id) {
                            if (evaluation[1].indicatorActivityDate && evaluation[1].progression === Progression.FollowUp) {
                                activityDate = evaluation[1].indicatorActivityDate
                            }
                        }
                        else if (evaluation[1].project.indicatorEvaluationId === evaluation[1].id) {
                            if (evaluation[1].indicatorActivityDate && evaluation[1].progression === Progression.FollowUp) {
                                activityDate = evaluation[1].indicatorActivityDate
                            }
                        }
                    })
                    if (projectBMTScores.length > 0) {
                        projectBMTScores.forEach((score: any, index: any) => {
                            if (score.projectId === projectId) {
                                followUpScore = score.bmtScore
                            }
                        })
                    }
                    else if (generatedBMTScores) {
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
