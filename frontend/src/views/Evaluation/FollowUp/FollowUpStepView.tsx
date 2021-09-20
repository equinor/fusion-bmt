import React from 'react'

import { Tabs } from '@equinor/eds-core-react'

import { Evaluation } from '../../../api/models'
import FollowUpView from './FollowUpView'
import WorkshopSummaryView from './Summaries/WorkshopSummaryView'
import { StyledTabPanel } from '../../../components/StyledTabs'
import ActionTableWithApi from '../../../components/ActionTable/ActionTableWithApi'
import FollowUpSummaryView from './Summaries/FollowUpSummaryView'

const { List, Tab, Panels } = Tabs

interface Props {
    evaluation: Evaluation
}

const FollowUpsStepView = ({ evaluation }: Props) => {
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
                        <FollowUpView evaluation={evaluation} />
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
