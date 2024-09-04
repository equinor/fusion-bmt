import React from 'react'
import { Tabs } from '@equinor/eds-core-react'

import { Evaluation, Progression, Role } from '../api/models'
import ProgressSummary from './ProgressSummary'
import { StyledTabPanel } from './StyledTabs'

const { List, Tab, Panels } = Tabs

interface QuestionnaireStatusTabsProps {
    evaluation: Evaluation
    viewProgression: Progression
    allowedRoles: Role[]
}

const QuestionnaireStatusTabs = ({
    evaluation,
    children,
    viewProgression,
    allowedRoles,
}: React.PropsWithChildren<QuestionnaireStatusTabsProps>) => {
    const [activeTab, setActiveTab] = React.useState(0)

    return (
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
            <List id="fixed-tablist">
                <Tab>Questionnaire</Tab>
                <Tab>Progress</Tab>
            </List>
            <Panels>
                <StyledTabPanel>{children}</StyledTabPanel>
                <StyledTabPanel>
                    <ProgressSummary evaluation={evaluation} viewProgression={viewProgression} allowedRoles={allowedRoles} />
                </StyledTabPanel>
            </Panels>
        </Tabs>
    )
}

export default QuestionnaireStatusTabs
