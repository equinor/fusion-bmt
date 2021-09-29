import React, { useState } from 'react'
import { Tabs } from '@equinor/eds-core-react'

import { Evaluation, Role } from '../../../api/models'
import { useParticipant } from '../../../globals/contexts'
import { StyledTabPanel } from '../../../components/StyledTabs'
import WorkshopSummaryWithApi from './WorkshopSummaryWithApi'
import { participantCanEditWorkshopSummary, participantCanViewWorkshopSummary } from '../../../utils/RoleBasedAccess'

const { List, Tab, Panels } = Tabs

interface WorkshopTabsProps {
    evaluation: Evaluation
}

const WorkshopTabs = ({ children, evaluation }: React.PropsWithChildren<WorkshopTabsProps>) => {
    const [activeTab, setActiveTab] = useState(0)
    const participant = useParticipant()

    return (
        <Tabs activeTab={activeTab} onChange={setActiveTab} data-testid="workshop_assessment_tabs">
            <List data-testid="workshop_assessment_tablist">
                <Tab>Questionaire</Tab>
                <Tab disabled={!participantCanViewWorkshopSummary(participant)}>Workshop Summary</Tab>
            </List>
            <Panels>
                <StyledTabPanel>{children}</StyledTabPanel>
                <StyledTabPanel>
                    <WorkshopSummaryWithApi evaluation={evaluation} disable={!participantCanEditWorkshopSummary(participant)} />
                </StyledTabPanel>
            </Panels>
        </Tabs>
    )
}

export default WorkshopTabs
