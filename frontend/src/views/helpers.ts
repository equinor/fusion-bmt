import { Question } from '../api/models'

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

const selectNewQuestionInSidebar = (
    questionNumber: number,
    questions: Question[],
    changeQuestion: (question: Question, questionNumber: number) => void
) => {
    const nextQuestion = questions.find(question => question.order === questionNumber)
    if (nextQuestion !== undefined) {
        changeQuestion(nextQuestion, questionNumber)
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
            const questionBelowNumber = selectedQuestion.order + 1
            const questionBelowElement = document.getElementById(`question-${questionBelowNumber}`)
            const isQuestionBelowInView = isQuestionStillInView(questionBelowElement, topPlacementInPixels)

            if (isQuestionBelowInView) {
                selectNewQuestionInSidebar(questionBelowNumber, questions, changeQuestion)
            } else {
                const questionAboveNumber = selectedQuestion.order - 1
                const questionAboveElement = document.getElementById(`question-${questionAboveNumber}`)
                const isQuestionAboveInView = isQuestionStillInView(questionAboveElement, topPlacementInPixels)

                if (isQuestionAboveInView) {
                    selectNewQuestionInSidebar(questionAboveNumber, questions, changeQuestion)
                }
            }
        }
    }
}
