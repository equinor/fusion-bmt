import React from 'react'

import { Box } from '@material-ui/core'
import { Button, Typography } from '@equinor/eds-core-react'

import { Barrier, Evaluation, Organization, Progression } from '../../../api/models'
import EvaluationSidebar from '../EvaluationSidebar'
import { barrierToString, progressionToString } from '../../../utils/EnumToString'
import ProgressionCompleteSwitch from '../../../components/ProgressionCompleteSwitch'
import { getNextProgression, progressionLessThan } from '../../../utils/ProgressionStatus'
import { useParticipant } from '../../../globals/contexts'
import QuestionsList from '../../../components/QuestionsList'
import { useFilter } from '../../../utils/hooks'
import OrganizationFilter from '../../../components/OrganizationFilter'
import { disableAnswer, disableCompleteSwitch, disableProgression } from '../../../utils/disableComponents'
import { participantCanProgressEvaluation } from '../../../utils/RoleBasedAccess'

interface IndividualViewProps {
    evaluation: Evaluation
    onNextStepClick: () => void
    onProgressParticipant: (newProgressions: Progression) => void
}

const IndividualView = ({ evaluation, onNextStepClick, onProgressParticipant }: IndividualViewProps) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)
    const headerRef = React.useRef<HTMLElement>(null)
    const { filter: organizationFilter, onFilterToggled: onOrganizationFilterToggled } = useFilter<Organization>()

    const questions = evaluation.questions
    const barrierQuestions = questions.filter(q => q.barrier === selectedBarrier)

    const viewProgression = Progression.Individual
    const participant = useParticipant()
    const isParticipantCompleted = participant ? progressionLessThan(viewProgression, participant.progression) : false

    const localOnClompleteClick = () => {
        const nextProgression = getNextProgression(participant!.progression)
        onProgressParticipant(nextProgression)
    }

    const localOnUncompleteClick = () => {
        onProgressParticipant(viewProgression)
    }

    const onBarrierSelected = (barrier: Barrier) => {
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
                        viewProgression={Progression.Individual}
                        onBarrierSelected={onBarrierSelected}
                    />
                </Box>
                <Box p="20px" width="1">
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
                                disabled={disableCompleteSwitch(participant, evaluation, viewProgression)}
                                onCompleteClick={localOnClompleteClick}
                                onUncompleteClick={localOnUncompleteClick}
                            />
                        </Box>
                        {participantCanProgressEvaluation(participant) && (
                            <Box>
                                <Button onClick={onNextStepClick} disabled={disableProgression(evaluation, participant, viewProgression)}>
                                    Finish {progressionToString(viewProgression)}
                                </Button>
                            </Box>
                        )}
                    </Box>
                    <QuestionsList
                        questions={barrierQuestions}
                        organizationFilter={organizationFilter}
                        viewProgression={viewProgression}
                        disable={disableAnswer(participant, evaluation, viewProgression)}
                    />
                </Box>
            </Box>
        </>
    )
}

export default IndividualView
