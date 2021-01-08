import React from 'react'
import { Tabs } from '@equinor/eds-core-react'
import styled from 'styled-components'

import {Evaluation, Progression, Role} from '../api/models'
import ProgressSummary from './ProgressSummary'

const { TabList, Tab, TabPanels, TabPanel } = Tabs

const StyledTabPanel = styled(TabPanel)`
  padding-top: 0px;
  border-top: 1px solid LightGray;
`

interface QuestionnaireStatusTabsProps {
    evaluation: Evaluation
    viewProgression: Progression
    allowedRoles: Role[]
}

const QuestionnaireStatusTabs = ({evaluation, children, viewProgression, allowedRoles}: React.PropsWithChildren<QuestionnaireStatusTabsProps>) => {
    const [activeTab, setActiveTab] = React.useState(0)

    return (
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
            <TabList>
                <Tab>Questionaire</Tab>
                <Tab>Progress</Tab>
            </TabList>
            <TabPanels>
                <StyledTabPanel>
                    {children}
                </StyledTabPanel>
                <StyledTabPanel>
                    <ProgressSummary evaluation={evaluation} viewProgression={viewProgression} allowedRoles={allowedRoles}/>
                </StyledTabPanel>
            </TabPanels>
        </Tabs>
    )
}

export default QuestionnaireStatusTabs
