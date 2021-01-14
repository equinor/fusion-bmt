import { Answer, Barrier, Evaluation, Organization, Participant, Progression, Question, Role, Severity, Status } from "../api/models"
import { checkIfAnswerFilled, getFilledUserAnswersForProgression } from './QuestionAndAnswerUtils'

const dummyAnswer: Answer = {
    id: '',
    progression: Progression.Preparation,
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
    it('Check if getFilledUserAnswersForProgression gets correct answers', () => {
        const evaluation: Evaluation = {
            createDate: new Date(),
            id: '',
            name: '',
            participants: [],
            progression: Progression.Alignment,
            project: {
                createDate: new Date(),
                evaluations: [],
                fusionProjectId: '',
                id: ''
            },
            questions: []
        }

        const question: Question = {
            actions: [],
            answers: [],
            barrier: Barrier.Gm,
            createDate: new Date(),
            evaluation,
            id: '',
            organization: Organization.All,
            questionTemplate: {
                barrier: Barrier.Gm,
                createDate: new Date(),
                id: '',
                organization: Organization.All,
                questions: [],
                status: Status.Active,
                supportNotes: '',
                text: ''
            },
            supportNotes: '',
            text: '',
        }

        const participant: Participant = {
            azureUniqueId: '1',
            createDate: new Date(),
            evaluation,
            evaluationId: evaluation.id,
            id: '',
            organization: Organization.All,
            progression: Progression.Alignment,
            role: Role.OrganizationLead,
        }

        const answer1: Answer = {
            createDate: new Date(),
            id: '',
            progression: Progression.Alignment,
            question,
            questionId: '',
            severity: Severity.High,
            text: 'answer1',
            answeredBy: participant
        }

        const answer2: Answer = {
            createDate: new Date(),
            id: '',
            progression: Progression.Preparation,
            question,
            questionId: '',
            severity: Severity.High,
            text: 'answer2',
            answeredBy: participant
        }

        question.answers = [answer1, answer2]

        const answers = getFilledUserAnswersForProgression([question], Progression.Alignment, participant.azureUniqueId)

        expect(answers.length).toBe(1)
    })
})
