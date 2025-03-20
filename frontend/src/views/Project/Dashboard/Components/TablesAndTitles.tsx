import { Accordion } from '@equinor/eds-core-react'
import { EvaluationsByProjectMaster } from '../../../../utils/hooks'
import EvaluationsTable from './EvaluationsTable'
import EvaluationScoreIndicator from '../../../../components/EvaluationScoreIndicator'
import FollowUpIndicator from '../../../../components/FollowUpIndicator'
import { noProjectMasterTitle } from '../../../../utils/hooks'
import styled from 'styled-components'
import { Evaluation, Progression } from '../../../../api/models'
import { useState } from 'react'
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
}

const TablesAndTitles = ({
    evaluationsWithProjectMasterTitle,
    generatedBMTScores,
}: Props) => {
    const [projectIndicators, setProjectIndicators] = useState<ProjectIndicator[]>([])
    const [projectBMTScores, setProjectBMTScores] = useState<ProjectBMTScore[]>([])
    const [openPanels, setOpenPanels] = useState<{ [key: string]: boolean }>({})

    const preprocessEvaluations = (evaluations: Evaluation[]) => {
        const activityDates: { [projectId: string]: string } = {}
        const followUpScores: { [projectId: string]: number | null } = {}

        evaluations.forEach(evalData => {
            const projectId = evalData.projectId
            const isFollowUp = evalData.progression === Progression.FollowUp
            const isIndicatorEvaluation = evalData.project.indicatorEvaluationId === evalData.id
            const isProjectIndicator = projectIndicators.some(pi => pi.evaluationId === evalData.id)

            if ((isProjectIndicator || isIndicatorEvaluation) && isFollowUp) {
                activityDates[projectId] = evalData.indicatorActivityDate || evalData.workshopCompleteDate || activityDates[projectId] || ""
            }

            if (!followUpScores[projectId]) {
                const score = projectBMTScores.find(score => score.projectId === projectId) ||
                              generatedBMTScores?.generateBmtScores.find((score: { projectId: string }) => score.projectId === projectId)
                followUpScores[projectId] = score ? score.followUpScore : null
            }
        })

        return { activityDates, followUpScores }
    }

    const { activityDates, followUpScores } = preprocessEvaluations(Object.values(evaluationsWithProjectMasterTitle).flat())

    const handlePanelToggle = (projectMasterTitle: string) => {
        setOpenPanels(prevState => ({
            ...prevState,
            [projectMasterTitle]: !prevState[projectMasterTitle],
        }))
    }

    return (
        <Accordion headerLevel="h2">
            {Object.entries(evaluationsWithProjectMasterTitle).map(([projectMasterTitle, evaluations], index) => {
                if (projectMasterTitle === noProjectMasterTitle) {
                    return null
                }

                const projectId = evaluations[0]?.projectId || ""
                const activityDate = activityDates[projectId] || ""
                const followUpScore = followUpScores[projectId]
                const isOpen = openPanels[projectMasterTitle] || false

                return (
                    <Accordion.Item key={index} isExpanded={isOpen} onExpandedChange={() => handlePanelToggle(projectMasterTitle)}>
                        <Accordion.Header>
                            <Indicators>
                                {projectMasterTitle}
                                <FollowUpIndicator value={followUpScore} />
                                <EvaluationScoreIndicator date={activityDate} />
                            </Indicators>
                        </Accordion.Header>
                        <StyledPanel>
                            {isOpen && (
                                <EvaluationsTable
                                    evaluations={evaluations}
                                    isInPortfolio={true}
                                    projectIndicators={projectIndicators}
                                    setProjectIndicators={setProjectIndicators}
                                    projectBMTScores={projectBMTScores}
                                    setProjectBmtScores={setProjectBMTScores}
                                />
                            )}
                        </StyledPanel>
                    </Accordion.Item>
                )
            })}
        </Accordion>
    )
}

export default TablesAndTitles
