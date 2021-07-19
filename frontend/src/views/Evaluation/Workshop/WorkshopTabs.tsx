import React, { useState } from 'react'
import { Tabs } from '@equinor/eds-core-react'

import { Evaluation, Role } from '../../../api/models'
import { useParticipant } from '../../../globals/contexts'
import { StyledTabPanel } from '../../../components/StyledTabs'
import WorkshopSummaryContainer from './WorkshopSummaryContainer'

const { TabList, Tab, TabPanels } = Tabs

interface WorkshopTabsProps {
    evaluation: Evaluation
    allowedRoles: Role[]
}

const WorkshopTabs = ({
    children,
    allowedRoles,
    evaluation,
}: React.PropsWithChildren<WorkshopTabsProps>) => {
    const [activeTab, setActiveTab] = useState(0)
    const participant = useParticipant()

    return (
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
            <TabList>
                <Tab>Questionaire</Tab>
                <Tab>Workshop Summary</Tab>
            </TabList>
            <TabPanels>
                <StyledTabPanel>{children}</StyledTabPanel>
                <StyledTabPanel>
                    {allowedRoles.includes(participant.role) && (
                        <WorkshopSummaryContainer evaluation={evaluation} />
                    )}
                </StyledTabPanel>
            </TabPanels>
        </Tabs>
    )
}

export default WorkshopTabs
