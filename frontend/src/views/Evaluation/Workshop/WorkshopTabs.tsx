import React, { useState } from 'react'
import { Tabs } from '@equinor/eds-core-react'

import { Evaluation, Role } from '../../../api/models'
import { useParticipant } from '../../../globals/contexts'
import { StyledTabPanel } from '../../../components/StyledTabs'
import WorkshopSummaryWithApi from './WorkshopSummaryWithApi'
import { participantCanEditWorkshopSummary, participantCanViewWorkshopSummary } from '../../../utils/RoleBasedAccess'

const { TabList, Tab, TabPanels } = Tabs

interface WorkshopTabsProps {
    evaluation: Evaluation
}

const WorkshopTabs = ({ children, evaluation }: React.PropsWithChildren<WorkshopTabsProps>) => {
    const [activeTab, setActiveTab] = useState(0)
    const participant = useParticipant()

    return (
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
            <TabList>
                <Tab>Questionaire</Tab>
                <Tab disabled={!participantCanViewWorkshopSummary(participant)}>Workshop Summary</Tab>
            </TabList>
            <TabPanels>
                <StyledTabPanel>{children}</StyledTabPanel>
                <StyledTabPanel>
                    <WorkshopSummaryWithApi evaluation={evaluation} disable={!participantCanEditWorkshopSummary(participant)} />
                </StyledTabPanel>
            </TabPanels>
        </Tabs>
    )
}

export default WorkshopTabs
