import React from 'react'

import { Box } from '@material-ui/core'
import { Typography } from '@equinor/eds-core-react'

import { Barrier, Evaluation, Question, Progression, Role, Severity, Organization } from '../../../api/models'
import AnswerSummarySidebar from '../../../components/AnswerSummarySidebar'
import { barrierToString } from '../../../utils/EnumToString'
import { useParticipant } from '../../../globals/contexts'
import { progressionLessThan } from '../../../utils/ProgressionStatus'
import SeveritySummary from '../../../components/SeveritySummary'
import QuestionProgressionFollowUpSidebar from './QuestionProgressionFollowUpSidebar'
import { countSeverities } from '../../../utils/Severity'
import QuestionsList from '../../../components/QuestionsList'
import { useFilter } from '../../../utils/hooks'
import OrganizationFilter from '../../../components/OrganizationFilter'
import { onScroll } from '../../helpers'

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

    const { role: participantRole, progression: participantProgression, azureUniqueId: participantUniqueId } = useParticipant()
    const allowedRoles = [Role.Facilitator]

    const isEvaluationAtThisProgression = evaluation.progression == viewProgression
    const participantAllowed = allowedRoles.includes(participantRole)
    const isParticipantCompleted = progressionLessThan(viewProgression, participantProgression)
    const isEvaluationFinishedHere = progressionLessThan(viewProgression, evaluation.progression)

    const disableAllUserInput = isEvaluationFinishedHere || !participantAllowed || !isEvaluationAtThisProgression

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

    const followUpBarrierAnswers = barrierQuestions.map(q => {
        const answers = q.answers.filter(a => a.progression === viewProgression)
        const length = answers.length
        if (length === 0) {
            return null
        }
        return answers[0]
    })

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
                                onOrganizationFilterToggled={onOrganizationFilterToggled}
                                questions={barrierQuestions}
                            />
                        </Box>
                        <Box>
                            <SeveritySummary
                                severityCount={countSeverities(followUpBarrierAnswers)}
                                onClick={severity => onSeverityFilterToggled(severity)}
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
                        disable={disableAllUserInput || isParticipantCompleted}
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
