import { Progression } from '../api/models'
import { progressionToString } from '../utils/EnumToString'
import ConfirmationDialog from './ConfirmationDialog'

interface ProgressEvaluationDialogProps {
    isOpen: boolean
    currentProgression: Progression
    onConfirmClick: () => void
    onCancelClick: () => void
}

const ProgressEvaluationDialog = ({ isOpen, currentProgression, onConfirmClick, onCancelClick }: ProgressEvaluationDialogProps) => {
    if (!isOpen) return <></>
    return (
        <>
            <ConfirmationDialog
                isOpen={isOpen}
                title="Progress to the next step?"
                description={progressionDialogTexts(currentProgression)}
                onConfirmClick={onConfirmClick}
                onCancelClick={onCancelClick}
            />
        </>
    )
}

const progressionDialogTexts = (progression: Progression): string => {
    switch (progression) {
        case Progression.Nomination:
            return `
        Progressing to ${progressionToString(Progression.Individual)} will disable the ability to delete participants.
    `
        case Progression.Individual:
        case Progression.Preparation:
        case Progression.Workshop:
            return `
        Progressing from ${progressionToString(progression)}
        will disable for everyone the ability to answer questions
        in the ${progressionToString(progression)} step.
    `
        case Progression.FollowUp:
            return `Progressing from ${progressionToString(progression)} will finish this evaluation. `
        case Progression.Finished:
            return ``
    }
}

export default ProgressEvaluationDialog
