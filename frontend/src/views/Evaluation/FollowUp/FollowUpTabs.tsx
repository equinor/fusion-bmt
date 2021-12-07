import React from 'react'
import { Tabs } from '@equinor/eds-core-react'

import { Evaluation } from '../../../api/models'
import { StyledTabPanel } from '../../../components/StyledTabs'
import FollowUpView from './Views/Questionaire/FollowUpView'
import WorkshopSummaryView from './Views/WorkshopSummary/WorkshopSummaryView'
import FollowUpSummaryView from './Views/FollowUpSummary/FollowUpSummaryView'
import ActionTableWithApi from './Views/Actions/ActionTableWithApi'

const { List, Tab, Panels } = Tabs

interface Props {
    evaluation: Evaluation
    onNextStepClick: () => void
}

const FollowUpsStepView = ({ evaluation, onNextStepClick }: Props) => {
    const [activeTab, setActiveTab] = React.useState(0)

    return (
        <>
            <Tabs activeTab={activeTab} onChange={setActiveTab}>
                <List id="fixed-tablist">
                    <Tab>Follow-up</Tab>
                    <Tab>Workshop Summary</Tab>
                    <Tab>Follow-up Summary</Tab>
                    <Tab>Actions</Tab>
                </List>
                <Panels>
                    <StyledTabPanel>
                        <FollowUpView evaluation={evaluation} onNextStepClick={onNextStepClick} />
                    </StyledTabPanel>
                    <StyledTabPanel>
                        <WorkshopSummaryView evaluation={evaluation} />
                    </StyledTabPanel>
                    <StyledTabPanel>
                        <FollowUpSummaryView evaluation={evaluation} />
                    </StyledTabPanel>
                    <StyledTabPanel>
                        <ActionTableWithApi evaluations={[evaluation]} />
                    </StyledTabPanel>
                </Panels>
            </Tabs>
        </>
    )
}

export default FollowUpsStepView
