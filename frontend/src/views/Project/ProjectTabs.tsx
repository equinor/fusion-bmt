import React, { useEffect } from 'react'
import { ApolloError, gql, useQuery } from '@apollo/client'

import { RouteComponentProps } from 'react-router-dom'
import ErrorMessage from '../../components/ErrorMessage'
import { Tabs, Typography } from '@equinor/eds-core-react'
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks'

import { BmtScore, Project, Status } from '../../api/models'
import { ProjectContext } from '../../globals/contexts'
import { StyledTabPanel } from '../../components/StyledTabs'
import ActionsView from './Actions/ActionsView'
import AdminView from './Admin/AdminView'
import DashboardView, { useAllEvaluationsQuery, useGenerateBMTScoresMutation } from './Dashboard/DashboardView'
import { genericErrorMessage } from '../../utils/Variables'
import { getCachedRoles } from '../../utils/helpers'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'
import Portfolios from './Dashboard/Components/Portfolios'
import { useEvaluationsWithPortfolio } from '../../utils/hooks'

const { List, Tab, Panels } = Tabs

interface Params {
    fusionProjectId: string
}

const ProjectTabs = ({ match }: RouteComponentProps<Params>) => {
    const currentUser = useCurrentUser()
    const { currentContext } = useModuleCurrentContext()

    const fusionProjectId = currentContext?.id ?? match.params.fusionProjectId
    const externalId = currentContext?.externalId

    const [activeTab, setActiveTab] = React.useState(0)

    const { loading, project, error } = useProjectQuery(fusionProjectId, externalId ?? '')

    const isAdmin = currentUser && getCachedRoles()?.includes('Role.Admin')

    const [generatedBMTScores, setGeneratedBMTScores] = React.useState<BmtScore[] | undefined>(undefined)

    const { generateBMTScores, loading: loadingProgressEvaluation, error: errorProgressEvaluation } = useGenerateBMTScoresMutation()

    const {
        loading: loadingActiveEvaluations,
        evaluations: activeEvaluations,
        error: errorActiveEvaluations,
        refetch: refetchActiveEvaluations,
    } = useAllEvaluationsQuery(Status.Active)

    const allActiveEvaluationsWithProjectMasterAndPortfolio = useEvaluationsWithPortfolio(activeEvaluations) // TODO: re render when status changes

    useEffect(() => {
        const generateScore = async () => {
            const score = await generateBMTScores()
            if (score.data) {
                setGeneratedBMTScores(score.data)
            }
        }
        generateScore();
    }, [])


    if (!currentContext) {
        return (
            <>
                <Typography variant="h4">Please select a project above.</Typography>
                <br />
                <Typography variant="h6">Portfolios</Typography>
                <Portfolios
                    evaluationsWithProjectMasterAndPortfolio={allActiveEvaluationsWithProjectMasterAndPortfolio}
                    generatedBMTScores={generatedBMTScores}
                    refetchActiveEvaluations={refetchActiveEvaluations}
                />
            </>
        )
    }

    if (loading) {
        return <>Loading...</>
    }

    if (error !== undefined || project === undefined) {
        return <ErrorMessage title="Could not load project" message={genericErrorMessage} />
    }

    return (
        <ProjectContext.Provider value={project}>
            <Tabs activeTab={activeTab} onChange={setActiveTab}>
                <List>
                    <Tab>Dashboard</Tab>
                    <Tab>Actions</Tab>
                    <Tab>Admin</Tab>
                </List>
                <Panels>
                    <StyledTabPanel>
                        <DashboardView project={project} />
                    </StyledTabPanel>
                    <StyledTabPanel>
                        <ActionsView azureUniqueId={currentUser!.localAccountId} />
                    </StyledTabPanel>
                    {isAdmin ? (
                        <StyledTabPanel>
                            <AdminView />
                        </StyledTabPanel>
                    ) : (
                        <></>
                    )}
                </Panels>
            </Tabs>
        </ProjectContext.Provider>
    )
}

export default ProjectTabs

interface ProjectQueryProps {
    loading: boolean
    project: Project | undefined
    error: ApolloError | undefined
}

const useProjectQuery = (fusionProjectId: string, externalID: string): ProjectQueryProps => {
    const GET_PROJECT = gql`
        query {
            project(fusionProjectID: "${fusionProjectId}", externalID: "${externalID}") {
                id
                fusionProjectId
                externalId
                createDate
            }
        }
    `

    const { loading, data, error } = useQuery<{ project: Project }>(GET_PROJECT)

    return {
        loading,
        project: data?.project,
        error,
    }
}
