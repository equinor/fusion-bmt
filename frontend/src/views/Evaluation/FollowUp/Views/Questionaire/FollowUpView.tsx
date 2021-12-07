import React from 'react'

import { Box } from '@material-ui/core'
import { Button, Typography } from '@equinor/eds-core-react'

import { Barrier, Evaluation, Question, Progression, Severity, Organization } from '../../../../../api/models'
import { barrierToString, progressionToString } from '../../../../../utils/EnumToString'
import { useParticipant } from '../../../../../globals/contexts'
import { countSeverities } from '../../../../../utils/Severity'
import { useFilter } from '../../../../../utils/hooks'
import { getBarrierAnswers, onScroll } from '../../../../helpers'
import { hasSeverity, hasOrganization, toggleFilter } from '../../../../../utils/QuestionAndAnswerUtils'
import { disableAnswer, disableProgression } from '../../../../../utils/disableComponents'
import { participantCanProgressEvaluation } from '../../../../../utils/RoleBasedAccess'
import SeveritySummary from '../../../../../components/SeveritySummary'
import QuestionProgressionFollowUpSidebar from '../../components/QuestionProgressionFollowUpSidebar'
import QuestionsList from '../../../../../components/QuestionsList'
import OrganizationFilter from '../../../../../components/OrganizationFilter'
import AnswerSummarySidebar from '../../../../../components/AnswerSummarySidebar'

interface FollowUpViewProps {
    evaluation: Evaluation
    onNextStepClick: () => void
}

const FollowUpView = ({ evaluation, onNextStepClick }: FollowUpViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question | undefined>(undefined)
    const { filter: severityFilter, onFilterToggled: onSeverityFilterToggled } = useFilter<Severity>()
    const { filter: organizationFilter, onFilterToggled: onOrganizationFilterToggled } = useFilter<Organization>()
    const headerRef = React.useRef<HTMLElement>(null)

    const questions = evaluation.questions
    const viewProgression = Progression.FollowUp
    const barrierQuestions = questions.filter(q => q.barrier === selectedBarrier)

    const onQuestionSummarySelected = (question: Question) => {
        if (selectedQuestion && question.id === selectedQuestion.id) {
            setSelectedQuestion(undefined)
            return
        }
        setSelectedQuestion(question)
    }

    const participant = useParticipant()

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
                    <QuestionProgressionFollowUpSidebar
                        questions={questions}
                        selectedBarrier={selectedBarrier}
                        onSelectBarrier={onBarrierSelected}
                    />
                </Box>
                <Box
                    p="20px"
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
                            <Box flexDirection="row" mt={1} display="flex" justifyContent="flex-end">
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
                            viewProgression={Progression.FollowUp}
                        />
                    )}
                </Box>
            </Box>
        </>
    )
}

export default FollowUpView
