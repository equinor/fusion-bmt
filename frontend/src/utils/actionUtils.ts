import { Action, Evaluation, Question } from '../api/models'
import { useEvaluationQuery } from '../views/Evaluation/EvaluationView'

export interface ActionQuestionAndEvaluation {
    action: Action
    question: Question
    evaluation: Evaluation
}

export interface ActionByState {
    overdueActions: Action[]
    openActions: Action[]
    closedActions: Action[]
}

export const getActionQuestionsAndEvaluations = (evaluations: Evaluation[]): ActionQuestionAndEvaluation[] => {
    const actionQuestionAndEvaluations: ActionQuestionAndEvaluation[] = []

    evaluations.forEach(evaluation => {
        evaluation.questions.forEach((question: Question) => {
            question.actions.forEach(action => {
                if (!action.isVoided) {
                    actionQuestionAndEvaluations.push({ action, question, evaluation })
                }
            })
        })
    })

    return actionQuestionAndEvaluations
}

export const getVoidedActions = (e: Evaluation): Action[] => {
    const { evaluation } = useEvaluationQuery(e.id)
    const actions: Action[] = []

    if (evaluation === null || evaluation === undefined) {
        return actions
    }
    evaluation.questions.forEach((question: Question) => {
        question.actions.forEach(action => {
            if (action.isVoided) {
                actions.push(action)
            }
        })
    })
    return actions
}

export const getEvaluationActionsByState = (evaluation: Evaluation): ActionByState => {
    const overdueActions: Action[] = []
    const openActions: Action[] = []
    const closedActions: Action[] = []
    const now = new Date()
    const voidedActions = getVoidedActions(evaluation)

    evaluation.questions.forEach((question: Question) => {
        question.actions.forEach(action => {
            const dueDate = new Date(action.dueDate)
            if (now >= dueDate && action.completed === false) {
                if (!voidedActions.some(a => a.id === action.id)) {
                    overdueActions.push(action)
                }
            } else if (now < dueDate && action.completed === false) {
                openActions.push(action)
            } else if (action.completed === true) {
                closedActions.push(action)
            }
        })
    })
    return { overdueActions, openActions, closedActions }
}
