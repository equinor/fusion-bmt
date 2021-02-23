import React from 'react'

import { Tabs } from '@equinor/eds-core-react'

import { Evaluation } from '../../../api/models'
import FollowUpView from './FollowUpView'
import WorkshopSummaryView from './WorkshopSummary/WorkshopSummaryView'
import { StyledTabPanel } from '../../../components/StyledTabs'
import ActionTableWithApi from '../../../components/ActionTable/ActionTableWithApi'

const { TabList, Tab, TabPanels } = Tabs

interface Props {
    evaluation: Evaluation
}

const FollowUpsStepView = ({ evaluation }: Props) => {
    const [activeTab, setActiveTab] = React.useState(0)

    return (
        <>
            <Tabs activeTab={activeTab} onChange={setActiveTab}>
                <TabList>
                    <Tab>Follow-up</Tab>
                    <Tab>Workshop Summary</Tab>
                    <Tab>Actions</Tab>
                </TabList>
                <TabPanels>
                    <StyledTabPanel>
                        <FollowUpView evaluation={evaluation} />
                    </StyledTabPanel>
                    <StyledTabPanel>
                        <WorkshopSummaryView evaluation={evaluation} />
                    </StyledTabPanel>
                    <StyledTabPanel>
                        <ActionTableWithApi evaluations={[evaluation]} />
                    </StyledTabPanel>
                </TabPanels>
            </Tabs>
        </>
    )
}

export default FollowUpsStepView
