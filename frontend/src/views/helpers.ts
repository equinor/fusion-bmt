import { Progression, Question } from '../api/models'
import { Validity } from '../components/Action/utils'
import { SavingState } from '../utils/Variables'

export const isQuestionStillInView = (selectedQuestionElement: HTMLElement | null, topPlacementInPixels: number | null) => {
    if (selectedQuestionElement !== null && topPlacementInPixels !== null) {
        const questionPosition = selectedQuestionElement.getBoundingClientRect()

        return (
            questionPosition.top >= topPlacementInPixels &&
            questionPosition.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        )
    }
    return false
}

/* Finds the nearest neighboor of the selectedQuestion that is in View - if any
 */
const findNewQuestionInView = (selectedQuestion: Question, questions: Question[], topPlacementInPixels: number | null) => {
    const questionIndex = questions.findIndex(q => q.order === selectedQuestion.order)

    let up = questionIndex
    let down = questionIndex
    while (true) {
        up -= 1
        down += 1

        // Terminate without a result when the search space is exhausted
        if (down >= questions.length && up < 0) {
            return
        }

        if (up >= 0) {
            const candidate = questions[up].order
            const element = document.getElementById(`question-${candidate}`)
            if (isQuestionStillInView(element, topPlacementInPixels)) {
                return questions[up]
            }
        }

        if (down < questions.length) {
            const candidate = questions[down].order
            const element = document.getElementById(`question-${candidate}`)
            if (isQuestionStillInView(element, topPlacementInPixels)) {
                return questions[down]
            }
        }
    }
}

export const onScroll = (
    selectedQuestion: Question | undefined,
    topPlacementInPixels: number | null,
    questions: Question[],
    changeQuestion: (question: Question, questionNumber: number) => void
) => {
    if (selectedQuestion !== undefined) {
        const selectedQuestionElement = document.getElementById(`question-${selectedQuestion.order}`)
        const isStillInView = isQuestionStillInView(selectedQuestionElement, topPlacementInPixels)

        if (!isStillInView) {
            const newQuestion = findNewQuestionInView(
                selectedQuestion,
                questions.sort((q1, q2) => q1.order - q2.order),
                topPlacementInPixels
            )

            if (newQuestion) {
                changeQuestion(newQuestion, newQuestion.order)
            }
        }
    }
}

export const getBarrierAnswers = (barrierQuestions: Question[], viewProgression: Progression) => {
    return barrierQuestions.map(q => {
        const answers = q.answers.filter(a => a.progression === viewProgression)
        const length = answers.length
        if (length === 0) {
            return null
        }
        return answers[0]
    })
}

export const updateValidity = (isFieldValid: boolean, validityStatus: Validity, setValidity: (validity: Validity) => void) => {
    if (validityStatus === 'error') {
        if (isFieldValid) {
            setValidity('success')
        }
    } else if (validityStatus === 'success') {
        if (!isFieldValid) {
            setValidity('error')
        }
    }
}

export const deriveNewSavingState = (isLoading: boolean, currentSavingState: SavingState, errorHappened = false) => {
    if (isLoading) {
        return SavingState.Saving
    } else {
        if (currentSavingState === SavingState.Saving && !errorHappened) {
            return SavingState.Saved
        } else if (!errorHappened) {
            return SavingState.None
        } else {
            return SavingState.NotSaved
        }
    }
}
