import { Answer, Progression, Question, Severity } from "../api/models"
import { checkIfAnswerFilled } from './QuestionAndAnswerUtils'

const dummyAnswer: Answer = {
    id: '',
    progression: Progression.IndividualAssessment,
    severity: Severity.Na,
    text: '',
    createDate: '',
    question: {} as unknown as Question,
    questionId: ''
}

describe('Test QuestionAndAnswerUtils', () => {
    it('Check if answer is filled out when empty', () => {
        const answer = dummyAnswer
        answer.text = ''

        const isFilledOut = checkIfAnswerFilled(answer)

        expect(isFilledOut).toBe(false)
    }),

    it('Check if answer is filled out when something written', () => {
        const answer = dummyAnswer
        answer.text = 'This is some valid answer text!'

        const isFilledOut = checkIfAnswerFilled(answer)

        expect(isFilledOut).toBe(true)
    })
})
