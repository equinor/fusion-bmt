
import React from 'react'
import { Evaluation, Progression } from '../api/models'
import { Tabs, Tab } from '@equinor/fusion-components'
import ProgressSummary from './ProgressSummary'

interface QuestionnaireStatusTabsProps {
    evaluation: Evaluation
    viewProgression: Progression
}

const QuestionnaireStatusTabs = ({evaluation, children, viewProgression}: React.PropsWithChildren<QuestionnaireStatusTabsProps>) => {
    const [activeTabKey, setActiveTabKey] = React.useState('questionnaire')

    const changeTabKey = (tabKey: string) => setActiveTabKey(tabKey)

    return (
        <Tabs activeTabKey={activeTabKey} onChange={changeTabKey}>
            <Tab tabKey="questionnaire" title="Questionnaire">
                {children}
            </Tab>
            <Tab tabKey="progress" title="Progress">
                <ProgressSummary evaluation={evaluation} viewProgression={viewProgression} />
            </Tab>
        </Tabs>
    )
}

export default QuestionnaireStatusTabs
