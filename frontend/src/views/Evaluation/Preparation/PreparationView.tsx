import React from 'react'

import { Box } from '@material-ui/core'
import { Button, Typography } from '@equinor/eds-core-react'

import { Barrier, Evaluation, Question, Progression, Role, Organization } from '../../../api/models'
import EvaluationSidebar from '../EvaluationSidebar'
import AnswerSummarySidebar from '../../../components/AnswerSummarySidebar'
import { barrierToString, progressionToString } from '../../../utils/EnumToString'
import ProgressionCompleteSwitch from '../../../components/ProgressionCompleteSwitch'
import { useParticipant } from '../../../globals/contexts'
import { getNextProgression, progressionGreaterThanOrEqual, progressionLessThan } from '../../../utils/ProgressionStatus'
import QuestionsList from '../../../components/QuestionsList'
import { useFilter } from '../../../utils/hooks'
import OrganizationFilter from '../../../components/OrganizationFilter'
import { onScroll } from '../../helpers'

const TOP_POSITION_SCROLL_WINDOW = 200

interface PreparationViewProps {
    evaluation: Evaluation
    onNextStepClick: () => void
    onProgressParticipant: (newProgressions: Progression) => void
}

const PreparationView = ({ evaluation, onNextStepClick, onProgressParticipant }: PreparationViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question | undefined>(undefined)
    const { filter: organizationFilter, onFilterToggled: onOrganizationFilterToggled } = useFilter<Organization>()

    const headerRef = React.useRef<HTMLElement>(null)

    const questions = evaluation.questions
    const barrierQuestions = questions.filter(q => q.barrier === selectedBarrier)

    const { role: participantRole, progression: participantProgression, azureUniqueId: participantUniqueId } = useParticipant()

    const viewProgression = Progression.Preparation
    const allowedRoles = [Role.Facilitator, Role.OrganizationLead]

    const isEvaluationAtThisProgression = evaluation.progression == viewProgression
    const participantAllowed = allowedRoles.includes(participantRole)
    const isParticipantCompleted = progressionLessThan(viewProgression, participantProgression)
    const isEvaluationFinishedHere = progressionLessThan(viewProgression, evaluation.progression)
    const hasParticipantBeenHere = progressionGreaterThanOrEqual(participantProgression, viewProgression)

    const disableAllUserInput = isEvaluationFinishedHere || !participantAllowed || !hasParticipantBeenHere

    const onQuestionSummarySelected = (question: Question) => {
        if (selectedQuestion && question.id === selectedQuestion.id) {
            setSelectedQuestion(undefined)
            return
        }
        setSelectedQuestion(question)
    }

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

    return (
        <>
            <Box display="flex" height={1}>
                <Box>
                    <EvaluationSidebar
                        questions={questions}
                        barrier={selectedBarrier}
                        viewProgression={Progression.Preparation}
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
                        <Box mr={2}>
                            <ProgressionCompleteSwitch
                                isCheckedInitially={isParticipantCompleted}
                                disabled={disableAllUserInput}
                                onCompleteClick={localOnClompleteClick}
                                onUncompleteClick={localOnUncompleteClick}
                            />
                        </Box>
                        <Box>
                            <Button
                                onClick={onNextStepClick}
                                disabled={participantRole !== Role.Facilitator || !isEvaluationAtThisProgression}
                            >
                                Finish {progressionToString(viewProgression)}
                            </Button>
                        </Box>
                    </Box>
                    <QuestionsList
                        questions={barrierQuestions}
                        organizationFilter={organizationFilter}
                        viewProgression={viewProgression}
                        disable={disableAllUserInput || isParticipantCompleted}
                        onQuestionSummarySelected={onQuestionSummarySelected}
                    />
                </Box>
                <Box>
                    {selectedQuestion && (
                        <AnswerSummarySidebar
                            open={selectedQuestion !== undefined}
                            onCloseClick={closeAnswerSummarySidebar}
                            question={selectedQuestion}
                            viewProgression={Progression.Preparation}
                        />
                    )}
                </Box>
            </Box>
        </>
    )
}

export default PreparationView
