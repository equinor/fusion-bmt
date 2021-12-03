import React from 'react'
import { Box } from '@material-ui/core'
import { Button, Typography } from '@equinor/eds-core-react'

import { Barrier, Evaluation, Organization, Progression, Question, Severity } from '../../../../api/models'
import EvaluationSidebar from '../../../../components/EvaluationSidebar'
import AnswerSummarySidebar from '../../../../components/AnswerSummarySidebar'
import { barrierToString, progressionToString } from '../../../../utils/EnumToString'
import ProgressionCompleteSwitch from '../../../../components/ProgressionCompleteSwitch'
import { useParticipant } from '../../../../globals/contexts'
import { getNextProgression, progressionLessThan } from '../../../../utils/ProgressionStatus'
import QuestionsList from '../../../../components/QuestionsList'
import { useFilter } from '../../../../utils/hooks'
import OrganizationFilter from '../../../../components/OrganizationFilter'
import { getBarrierAnswers, onScroll } from '../../../helpers'
import SeveritySummary from '../../../../components/SeveritySummary'
import { countSeverities } from '../../../../utils/Severity'
import { hasSeverity, hasOrganization, toggleFilter } from '../../../../utils/QuestionAndAnswerUtils'
import { disableAnswer, disableCompleteSwitch, disableProgression } from '../../../../utils/disableComponents'
import { participantCanProgressEvaluation } from '../../../../utils/RoleBasedAccess'

interface WorkshopViewProps {
    evaluation: Evaluation
    onNextStepClick: () => void
    onProgressParticipant: (newProgressions: Progression) => void
}

const WorkshopView = ({ evaluation, onNextStepClick, onProgressParticipant }: WorkshopViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question | undefined>(undefined)
    const { filter: organizationFilter, onFilterToggled: onOrganizationFilterToggled } = useFilter<Organization>()
    const { filter: severityFilter, onFilterToggled: onSeverityFilterToggled } = useFilter<Severity>()

    const headerRef = React.useRef<HTMLElement>(null)

    const questions = evaluation.questions
    const barrierQuestions = questions.filter(q => q.barrier === selectedBarrier)

    const onQuestionSummarySelected = (question: Question) => {
        if (selectedQuestion && question.id === selectedQuestion.id) {
            setSelectedQuestion(undefined)
            return
        }
        setSelectedQuestion(question)
    }

    const viewProgression = Progression.Workshop
    const participant = useParticipant()
    const isParticipantCompleted = participant ? progressionLessThan(viewProgression, participant.progression) : false

    const localOnCompleteClick = () => {
        const nextProgression = getNextProgression(participant!.progression)
        onProgressParticipant(nextProgression)
    }

    const localOnUncompleteClick = () => {
        onProgressParticipant(viewProgression)
    }

    const closeAnswerSummarySidebar = () => {
        setSelectedQuestion(undefined)
    }

    const onBarrierSelected = (barrier: Barrier) => {
        closeAnswerSummarySidebar()
        setSelectedBarrier(barrier)
        if (headerRef !== null && headerRef.current) {
            headerRef.current.scrollIntoView()
        }
    }

    const setFirstQuestion = (questions: Question[]) => {
        if (questions.length == 0) {
            closeAnswerSummarySidebar()
        } else if (selectedQuestion) {
            setSelectedQuestion(questions[0])
        }
    }

    const filterAndSortQuestions = (organizations: Organization[], severities: Severity[]) => {
        return barrierQuestions
            .filter(q => hasSeverity(q, severities, participant, viewProgression))
            .filter(q => hasOrganization(q, organizations))
            .sort((q1, q2) => q1.order - q2.order)
    }

    const onSeverityFilterChange = (sev: Severity) => {
        const severities = toggleFilter(sev, severityFilter)
        const questions = filterAndSortQuestions(organizationFilter, severities)
        setFirstQuestion(questions)
        onSeverityFilterToggled(sev)
    }

    const onOrganizationFilterChange = (org: Organization) => {
        const orgs = toggleFilter(org, organizationFilter)
        const questions = filterAndSortQuestions(orgs, severityFilter)
        setFirstQuestion(questions)
        onOrganizationFilterToggled(org)
    }

    const barrierAnswers = getBarrierAnswers(barrierQuestions, viewProgression)

    // This is the lowest element above the questions list, so we are using this to calculate when something is scrolled out of view.
    // If tablist is removed from the UI, this will no longer work and we have to use the next element that is the lowest point above the questions list
    const tabList = document.getElementById('fixed-tablist')
    const tablistPosition = tabList && tabList.getBoundingClientRect()
    const tablistPositionBottom = tablistPosition ? tablistPosition.bottom : 0

    const boxPadding = 20
    const boxPaddingTopPlusBottom = boxPadding * 2
    const tabsPanelPadding = 16

    return (
        <>
            <Box display="flex" height={1}>
                <Box>
                    <EvaluationSidebar
                        questions={questions}
                        barrier={selectedBarrier}
                        viewProgression={Progression.Workshop}
                        onBarrierSelected={onBarrierSelected}
                    />
                </Box>
                <Box
                    p={`${boxPadding}px`}
                    width="1"
                    onScroll={() => {
                        onScroll(selectedQuestion, tablistPositionBottom, barrierQuestions, onQuestionSummarySelected)
                    }}
                    style={{
                        height: `calc(100vh - ${tablistPositionBottom + boxPaddingTopPlusBottom + tabsPanelPadding}px)`,
                        overflow: 'scroll',
                    }}
                >
                    <Box display="flex" flexDirection="row">
                        <Box flexGrow={1}>
                            <Typography variant="h2" ref={headerRef}>
                                {barrierToString(selectedBarrier)}
                            </Typography>
                            <OrganizationFilter
                                organizationFilter={organizationFilter}
                                onOrganizationFilterToggled={onOrganizationFilterChange}
                                questions={barrierQuestions}
                            />
                        </Box>
                        <Box flexDirection="column">
                            <Box ml={5}>
                                <SeveritySummary
                                    severityCount={countSeverities(barrierAnswers)}
                                    onClick={onSeverityFilterChange}
                                    severityFilter={severityFilter}
                                />
                            </Box>
                            <Box flexDirection="row" mt={1}>
                                <ProgressionCompleteSwitch
                                    isCheckedInitially={isParticipantCompleted}
                                    disabled={disableCompleteSwitch(participant, evaluation, viewProgression)}
                                    onCompleteClick={localOnCompleteClick}
                                    onUncompleteClick={localOnUncompleteClick}
                                />
                                {participantCanProgressEvaluation(participant) && (
                                    <Button
                                        style={{ marginLeft: '20px' }}
                                        onClick={onNextStepClick}
                                        disabled={disableProgression(evaluation, participant, viewProgression)}
                                    >
                                        {'Finish ' + progressionToString(viewProgression)}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <QuestionsList
                        displayActions
                        severityFilter={severityFilter}
                        organizationFilter={organizationFilter}
                        questions={barrierQuestions}
                        viewProgression={viewProgression}
                        disable={disableAnswer(participant, evaluation, viewProgression)}
                        onQuestionSummarySelected={onQuestionSummarySelected}
                    />
                </Box>
                <Box>
                    {selectedQuestion && (
                        <AnswerSummarySidebar
                            open={selectedQuestion != undefined}
                            onCloseClick={closeAnswerSummarySidebar}
                            question={selectedQuestion}
                            viewProgression={Progression.Workshop}
                        />
                    )}
                </Box>
            </Box>
        </>
    )
}

export default WorkshopView
