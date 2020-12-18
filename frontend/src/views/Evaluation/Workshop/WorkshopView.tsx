import React from 'react'
import { Box } from '@material-ui/core'
import { Button, Divider, Typography } from '@equinor/eds-core-react'

import { Barrier, Evaluation, Question, Progression, Role } from '../../../api/models'
import EvaluationSidebar from '../EvaluationSidebar'
import AnswerSummarySidebar from '../../../components/AnswerSummarySidebar'
import { barrierToString, progressionToString } from '../../../utils/EnumToString'
import ProgressionCompleteSwitch from '../../../components/ProgressionCompleteSwitch'
import { useParticipant } from '../../../globals/contexts'
import { getNextProgression, progressionGreaterThanOrEqual, progressionLessThan } from '../../../utils/ProgressionStatus'
import QuestionAndAnswerFormWithApi from '../../../components/QuestionAndAnswer/QuestionAndAnswerFormWithApi'
import { getNextBarrier } from '../../../utils/BarrierUtils'
import QuestionActionsListWithApi from '../../../components/Action/QuestionActionsListWithApi'

interface WorkshopViewProps
{
    evaluation: Evaluation
    onNextStepClick: () => void
    onProgressParticipant: (newProgressions: Progression) => void
}

const WorkshopView = ({evaluation, onNextStepClick, onProgressParticipant}: WorkshopViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)
    const [selectedQuestion, setSelectedQuestion] = React.useState<Question | undefined>(undefined)
    const [selectedQuestionNumber, setSelectedQuestionNumber] = React.useState<number | undefined>(undefined)

    const questions = evaluation.questions

    const onQuestionSummarySelected = (question: Question, questionNumber: number) => {
        setSelectedQuestion(question)
        setSelectedQuestionNumber(questionNumber)
    }

    const {role: participantRole, progression: participantProgression, azureUniqueId: participantUniqueId} = useParticipant()

    const viewProgression = Progression.Workshop
    const allowedRoles = [Role.Facilitator]

    const isEvaluationAtThisProgression = evaluation.progression == viewProgression
    const participantAllowed = allowedRoles.includes(participantRole)
    const isParticipantCompleted= progressionLessThan(viewProgression, participantProgression)
    const isEvaluationFinishedHere = progressionLessThan(viewProgression, evaluation.progression)
    const hasParticipantBeenHere = progressionGreaterThanOrEqual(participantProgression, viewProgression)

    const disableAllUserInput = isEvaluationFinishedHere
                                || !participantAllowed
                                || !hasParticipantBeenHere

    const localOnClompleteClick = () => {
        const nextProgression = getNextProgression(participantProgression)
        onProgressParticipant(nextProgression)
    }

    const localOnUnCompleteClick = () => {
        onProgressParticipant(viewProgression)
    }

    const nextBarrier = getNextBarrier(selectedBarrier)

    return (
        <>
            <Box display="flex" height={1}>
                <Box>
                    <EvaluationSidebar
                        questions={questions}
                        barrier={selectedBarrier}
                        viewProgression={Progression.Workshop}
                        onBarrierSelected={ (barrier) => setSelectedBarrier(barrier)}
                    />
                </Box>
                <Box p="20px" width="1">
                    <Box display="flex" flexDirection="row">
                        <Box flexGrow={1}>
                            <Typography variant="h2">{barrierToString(selectedBarrier)}</Typography>
                        </Box>
                        <Box mr={2}>
                            <ProgressionCompleteSwitch
                                isCheckedInitially={isParticipantCompleted}
                                disabled={disableAllUserInput}
                                onCompleteClick={localOnClompleteClick}
                                onUnCompleteClick={localOnUnCompleteClick}
                            />
                        </Box>
                        <Box>
                            <Button
                                onClick={onNextStepClick}
                                disabled={
                                    participantRole !== Role.Facilitator
                                    || !isEvaluationAtThisProgression
                                }
                            >
                                Finish { progressionToString(viewProgression) }
                            </Button>
                        </Box>
                    </Box>
                    {questions.filter(q => q.barrier === selectedBarrier).map((question, idx) => {
                        const answer = question.answers
                            .filter(a => a.progression === viewProgression)
                            .find(a => a.answeredBy?.azureUniqueId === participantUniqueId)
                        return (
                            <div key={question.id}>
                                <Divider />
                                <QuestionAndAnswerFormWithApi
                                    questionNumber={idx+1}
                                    question={question}
                                    answer={answer}
                                    disabled={disableAllUserInput || isParticipantCompleted}
                                    onQuestionSummarySelected={ onQuestionSummarySelected }
                                    viewProgression={viewProgression}
                                />
                                <QuestionActionsListWithApi
                                    question={question}
                                />
                            </div>
                        )
                    })}
                    {nextBarrier !== undefined &&
                        <Button onClick={ () => {
                            setSelectedBarrier(nextBarrier)
                            window.scrollTo({top: 0, behavior: 'smooth'})
                        }}>
                            Next Barrier: {barrierToString(nextBarrier)}
                        </Button>
                    }
                </Box>
                <Box>
                    { selectedQuestion && selectedQuestionNumber &&
                        <AnswerSummarySidebar
                            open={selectedQuestion != undefined}
                            onCloseClick={() => {
                                setSelectedQuestion(undefined)
                                setSelectedQuestionNumber(undefined)
                            }}
                            question={selectedQuestion}
                            questionNumber={selectedQuestionNumber}
                            viewProgression={Progression.Workshop}
                        />
                    }
                </Box>
            </Box>
        </>
    )
}

export default WorkshopView
