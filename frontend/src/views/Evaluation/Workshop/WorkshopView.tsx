import React from 'react'
import { Box } from '@material-ui/core'
import { Button, Typography } from '@equinor/eds-core-react'

import { Barrier, Evaluation, Progression, Question, Role } from '../../../api/models'
import EvaluationSidebar from '../EvaluationSidebar'
import AnswerSummarySidebar from '../../../components/AnswerSummarySidebar'
import { barrierToString, progressionToString } from '../../../utils/EnumToString'
import ProgressionCompleteSwitch from '../../../components/ProgressionCompleteSwitch'
import { useParticipant } from '../../../globals/contexts'
import { getNextProgression, progressionGreaterThanOrEqual, progressionLessThan } from '../../../utils/ProgressionStatus'
import QuestionsList from '../../../components/QuestionsList'

interface WorkshopViewProps {
    evaluation: Evaluation
    onNextStepClick: () => void
    onProgressParticipant: (newProgressions: Progression) => void
}

const WorkshopView = ({ evaluation, onNextStepClick, onProgressParticipant }: WorkshopViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question | undefined>(undefined)
    const [selectedQuestionNumber, setSelectedQuestionNumber] = React.useState<number | undefined>(undefined)

    const headerRef = React.useRef<HTMLElement>(null)

    const questions = evaluation.questions

    const onQuestionSummarySelected = (question: Question, questionNumber: number) => {
        if (selectedQuestion && question.id === selectedQuestion.id) {
            setSelectedQuestion(undefined)
            setSelectedQuestionNumber(undefined)
            return
        }
        setSelectedQuestion(question)
        setSelectedQuestionNumber(questionNumber)
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
        setSelectedQuestionNumber(undefined)
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
                        viewProgression={Progression.Workshop}
                        onBarrierSelected={onBarrierSelected}
                    />
                </Box>
                <Box p="20px" width="1">
                    <Box display="flex" flexDirection="row">
                        <Box flexGrow={1}>
                            <Typography variant="h2" ref={headerRef}>
                                {barrierToString(selectedBarrier)}
                            </Typography>
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
                        displayActions
                        questions={questions.filter(q => q.barrier === selectedBarrier)}
                        viewProgression={viewProgression}
                        disable={!isParticipantFacilitator && (disableAllUserInput || isParticipantCompleted)}
                        onQuestionSummarySelected={onQuestionSummarySelected}
                    />
                </Box>
                <Box>
                    {selectedQuestion && selectedQuestionNumber && (
                        <AnswerSummarySidebar
                            open={selectedQuestion != undefined}
                            onCloseClick={closeAnswerSummarySidebar}
                            question={selectedQuestion}
                            questionNumber={selectedQuestionNumber}
                            viewProgression={Progression.Workshop}
                        />
                    )}
                </Box>
            </Box>
        </>
    )
}

export default WorkshopView
