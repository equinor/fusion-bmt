import React from 'react'

import { Box } from '@material-ui/core'
import { Divider, Typography } from '@equinor/eds-core-react'

import { Barrier, Evaluation, Question, Progression, Role } from '../../../api/models'
import AnswerSummarySidebar from '../../../components/AnswerSummarySidebar'
import { barrierToString } from '../../../utils/EnumToString'
import { useParticipant } from '../../../globals/contexts'
import { progressionLessThan } from '../../../utils/ProgressionStatus'
import QuestionAndAnswerFormWithApi from '../../../components/QuestionAndAnswer/QuestionAndAnswerFormWithApi'
import QuestionActionsListWithApi from '../../../components/Action/QuestionActionsListWithApi'
import SeveritySummary from '../../../components/SeveritySummary'
import QuestionProgressionFollowUpSidebar from './QuestionProgressionFollowUpSidebar'
import { countSeverities } from '../../../utils/Severity'

interface FollowUpViewProps {
    evaluation: Evaluation
}

const FollowUpView = ({ evaluation }: FollowUpViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question | undefined>(undefined)
    const [selectedQuestionNumber, setSelectedQuestionNumber] = React.useState<number | undefined>(undefined)

    const questions = evaluation.questions
    const barrierQuestions = questions.filter(q => q.barrier === selectedBarrier)

    const onQuestionSummarySelected = (question: Question, questionNumber: number) => {
        setSelectedQuestion(question)
        setSelectedQuestionNumber(questionNumber)
    }

    const { role: participantRole, progression: participantProgression, azureUniqueId: participantUniqueId } = useParticipant()

    const viewProgression = Progression.FollowUp
    const allowedRoles = [Role.Facilitator]

    const isEvaluationAtThisProgression = evaluation.progression == viewProgression
    const participantAllowed = allowedRoles.includes(participantRole)
    const isParticipantCompleted = progressionLessThan(viewProgression, participantProgression)
    const isEvaluationFinishedHere = progressionLessThan(viewProgression, evaluation.progression)

    const disableAllUserInput = isEvaluationFinishedHere || !participantAllowed || !isEvaluationAtThisProgression

    const closeAnswerSummarySidebar = () => {
        setSelectedQuestion(undefined)
        setSelectedQuestionNumber(undefined)
    }

    const onBarrierSelected = (barrier: Barrier) => {
        closeAnswerSummarySidebar()
        setSelectedBarrier(barrier)
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
                <Box p="20px" width="1">
                    <Box display="flex" flexDirection="row">
                        <Box flexGrow={1}>
                            <Typography variant="h2">{barrierToString(selectedBarrier)}</Typography>
                        </Box>
                        <Box>
                            <SeveritySummary severityCount={countSeverities(followUpBarrierAnswers)} />
                        </Box>
                    </Box>
                    {barrierQuestions.map((question, idx) => {
                        const answer = question.answers
                            .filter(a => a.progression === viewProgression)
                            .find(a => a.answeredBy?.azureUniqueId === participantUniqueId)
                        return (
                            <div key={question.id}>
                                <Divider />
                                <QuestionAndAnswerFormWithApi
                                    questionNumber={idx + 1}
                                    question={question}
                                    answer={answer}
                                    disabled={disableAllUserInput || isParticipantCompleted}
                                    onQuestionSummarySelected={onQuestionSummarySelected}
                                    viewProgression={viewProgression}
                                />
                                <QuestionActionsListWithApi question={question} />
                            </div>
                        )
                    })}
                </Box>
                <Box>
                    {selectedQuestion && selectedQuestionNumber && (
                        <AnswerSummarySidebar
                            open={selectedQuestion != undefined}
                            onCloseClick={closeAnswerSummarySidebar}
                            question={selectedQuestion}
                            questionNumber={selectedQuestionNumber}
                            viewProgression={Progression.FollowUp}
                        />
                    )}
                </Box>
            </Box>
        </>
    )
}

export default FollowUpView
