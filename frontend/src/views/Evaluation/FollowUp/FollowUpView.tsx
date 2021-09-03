import React from 'react'

import { Box } from '@material-ui/core'
import { Typography } from '@equinor/eds-core-react'

import { Barrier, Evaluation, Question, Progression, Severity, Organization } from '../../../api/models'
import AnswerSummarySidebar from '../../../components/AnswerSummarySidebar'
import { barrierToString } from '../../../utils/EnumToString'
import { useParticipant } from '../../../globals/contexts'
import SeveritySummary from '../../../components/SeveritySummary'
import QuestionProgressionFollowUpSidebar from './QuestionProgressionFollowUpSidebar'
import { countSeverities } from '../../../utils/Severity'
import QuestionsList from '../../../components/QuestionsList'
import { useFilter } from '../../../utils/hooks'
import OrganizationFilter from '../../../components/OrganizationFilter'
import { getBarrierAnswers, onScroll } from '../../helpers'
import { hasSeverity, hasOrganization, toggleFilter } from '../../../utils/QuestionAndAnswerUtils'
import { disableAnswer } from '../../../utils/disableComponents'

const TOP_POSITION_SCROLL_WINDOW = 200

interface FollowUpViewProps {
    evaluation: Evaluation
}

const FollowUpView = ({ evaluation }: FollowUpViewProps) => {
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
                        onScroll(selectedQuestion, TOP_POSITION_SCROLL_WINDOW, barrierQuestions, onQuestionSummarySelected)
                    }}
                    style={{ height: '100vh', overflow: 'scroll' }}
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
                        <Box>
                            <SeveritySummary
                                severityCount={countSeverities(barrierAnswers)}
                                onClick={onSeverityFilterChange}
                                severityFilter={severityFilter}
                            />
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
