import React from 'react'
import { Box } from '@material-ui/core'
import { Button, Typography } from '@equinor/eds-core-react'

import { Barrier, Evaluation, Organization, Progression, Question, Role, Severity } from '../../../api/models'
import EvaluationSidebar from '../EvaluationSidebar'
import AnswerSummarySidebar from '../../../components/AnswerSummarySidebar'
import { barrierToString, progressionToString } from '../../../utils/EnumToString'
import ProgressionCompleteSwitch from '../../../components/ProgressionCompleteSwitch'
import { useParticipant } from '../../../globals/contexts'
import { getNextProgression, progressionGreaterThanOrEqual, progressionLessThan } from '../../../utils/ProgressionStatus'
import QuestionsList from '../../../components/QuestionsList'
import { useFilter } from '../../../utils/hooks'
import OrganizationFilter from '../../../components/OrganizationFilter'
import { getBarrierAnswers, onScroll } from '../../helpers'
import SeveritySummary from '../../../components/SeveritySummary'
import { countSeverities } from '../../../utils/Severity'

const TOP_POSITION_SCROLL_WINDOW = 150

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

    const { role: participantRole, progression: participantProgression, azureUniqueId: participantUniqueId } = useParticipant()

    const viewProgression = Progression.Workshop
    const allowedRoles = [Role.Facilitator]

    const isEvaluationAtThisProgression = evaluation.progression == viewProgression
    const participantAllowed = allowedRoles.includes(participantRole)
    const isParticipantCompleted = progressionLessThan(viewProgression, participantProgression)
    const isParticipantFacilitator = participantRole === Role.Facilitator
    const isEvaluationFinishedHere = progressionLessThan(viewProgression, evaluation.progression)
    const hasParticipantBeenHere = progressionGreaterThanOrEqual(participantProgression, viewProgression)

    const disableAllUserInput = isEvaluationFinishedHere || !participantAllowed || !hasParticipantBeenHere

    const localOnClompleteClick = () => {
        const nextProgression = getNextProgression(participantProgression)
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

    const barrierAnswers = getBarrierAnswers(barrierQuestions, viewProgression)

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
                        <Box flexDirection="column">
                            <Box ml={5}>
                                <SeveritySummary
                                    severityCount={countSeverities(barrierAnswers)}
                                    onClick={severity => onSeverityFilterToggled(severity)}
                                    severityFilter={severityFilter}
                                />
                            </Box>
                            <Box flexDirection="row" mt={1}>
                                <ProgressionCompleteSwitch
                                    isCheckedInitially={isParticipantCompleted}
                                    disabled={disableAllUserInput}
                                    onCompleteClick={localOnClompleteClick}
                                    onUncompleteClick={localOnUncompleteClick}
                                />
                                <Button
                                    style={{ marginLeft: '20px' }}
                                    onClick={onNextStepClick}
                                    disabled={participantRole !== Role.Facilitator || !isEvaluationAtThisProgression}
                                >
                                    {'Finish ' + progressionToString(viewProgression)}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                    <QuestionsList
                        displayActions
                        severityFilter={severityFilter}
                        organizationFilter={organizationFilter}
                        questions={barrierQuestions}
                        viewProgression={viewProgression}
                        disable={!isParticipantFacilitator && (disableAllUserInput || isParticipantCompleted)}
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
