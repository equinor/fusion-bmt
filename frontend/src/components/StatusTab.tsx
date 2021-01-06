
import React from 'react'
import {Evaluation, Progression, Role} from '../api/models'
import { Tabs, Tab } from '@equinor/fusion-components'
import ProgressSummary from './ProgressSummary'

interface QuestionnaireStatusTabsProps {
    evaluation: Evaluation
    viewProgression: Progression
    allowedRoles: Role[]
}

const QuestionnaireStatusTabs = ({evaluation, children, viewProgression, allowedRoles}: React.PropsWithChildren<QuestionnaireStatusTabsProps>) => {
    const [activeTabKey, setActiveTabKey] = React.useState('questionnaire')

    const changeTabKey = (tabKey: string) => setActiveTabKey(tabKey)

    return (
        <Tabs activeTabKey={activeTabKey} onChange={changeTabKey}>
            <Tab tabKey="questionnaire" title="Questionnaire">
                {children}
            </Tab>
            <Tab tabKey="progress" title="Progress">
                <ProgressSummary evaluation={evaluation} viewProgression={viewProgression} allowedRoles={allowedRoles}/>
            </Tab>
        </Tabs>
    )
}

export default QuestionnaireStatusTabs
