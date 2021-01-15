import React from 'react'

import { Tabs } from '@equinor/eds-core-react'

import { Evaluation } from '../../../api/models'
import FollowUpView from './FollowUpView'
import WorkshopSummaryView from './WorkshopSummary/WorkshopSymmaryView'
import { StyledTabPanel } from '../../../components/StyledTabs'

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
                </TabList>
                <TabPanels>
                    <StyledTabPanel>
                        <FollowUpView evaluation={evaluation} />
                    </StyledTabPanel>
                    <StyledTabPanel>
                        <WorkshopSummaryView evaluation={evaluation} />
                    </StyledTabPanel>
                </TabPanels>
            </Tabs>
        </>
    )
}

export default FollowUpsStepView
