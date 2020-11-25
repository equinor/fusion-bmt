import { Answer } from '../api/models'

export const checkIfAnswerFilled = (answer: Answer): boolean => {
    return answer.text !== ""
}
