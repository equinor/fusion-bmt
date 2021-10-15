import { Answer, Barrier, Evaluation, Organization, Participant, Progression, Question, Role, Severity, Status } from '../api/models'
import { checkIfAnswerFilled, getFilledUserAnswersForProgression } from './QuestionAndAnswerUtils'

const dummyAnswer: Answer = {
    id: '',
    progression: Progression.Individual,
    severity: Severity.Na,
    text: '',
    createDate: '',
    question: ({} as unknown) as Question,
    questionId: '',
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

describe('Test getFilledUserAnswersForProgression', () => {
    it('gets answers only from the stage the user is currently at', () => {
        question.answers = [answer1, answer2]

        const answers = getFilledUserAnswersForProgression([question], Progression.Preparation, participant.azureUniqueId)

        expect(answers.length).toBe(1)
    })

    it('get only the users own answers, not answers from others, from the current stage', () => {
        question.answers = [answer2, answer5]

        const answers = getFilledUserAnswersForProgression([question], Progression.Individual, participant.azureUniqueId)

        expect(answers.length).toBe(1)
        expect(answers[0].answeredBy && answers[0].answeredBy.azureUniqueId).toBe(participant.azureUniqueId)
    })

    it('gets answers from all users on workshop step', () => {
        question.answers = [answer3, answer4]

        const answers = getFilledUserAnswersForProgression([question], Progression.Workshop, facilitator1.azureUniqueId)

        expect(answers.length).toBe(2)
    })

    it('gets answers from all users on workshop step, also when participant and not facilitator is using the application', () => {
        question.answers = [answer3, answer4]

        const answers = getFilledUserAnswersForProgression([question], Progression.Workshop, participant.azureUniqueId)

        expect(answers.length).toBe(2)
    })

    const evaluation: Evaluation = {
        createDate: new Date(),
        id: '',
        name: '',
        participants: [],
        progression: Progression.Preparation,
        status: Status.Active,
        project: {
            createDate: new Date(),
            evaluations: [],
            fusionProjectId: '',
            id: '',
        },
        questions: [],
    }

    const question: Question = {
        actions: [],
        answers: [],
        barrier: Barrier.Gm,
        createDate: new Date(),
        evaluation,
        order: 1,
        id: '',
        organization: Organization.All,
        questionTemplate: {
            barrier: Barrier.Gm,
            createDate: new Date(),
            id: '',
            order: 1,
            adminOrder: 1,
            organization: Organization.All,
            questions: [],
            status: Status.Active,
            supportNotes: '',
            text: '',
            projectCategories: []
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
        progression: Progression.Preparation,
        role: Role.OrganizationLead,
    }

    const participant2: Participant = {
        azureUniqueId: '2',
        createDate: new Date(),
        evaluation,
        evaluationId: evaluation.id,
        id: '',
        organization: Organization.All,
        progression: Progression.Preparation,
        role: Role.Participant,
    }

    const facilitator1: Participant = {
        azureUniqueId: 'a',
        createDate: new Date(),
        evaluation,
        evaluationId: evaluation.id,
        id: '',
        organization: Organization.All,
        progression: Progression.Workshop,
        role: Role.Facilitator,
    }

    const facilitator2: Participant = {
        azureUniqueId: 'b',
        createDate: new Date(),
        evaluation,
        evaluationId: evaluation.id,
        id: '',
        organization: Organization.All,
        progression: Progression.Workshop,
        role: Role.Facilitator,
    }

    const answer1: Answer = {
        createDate: new Date(),
        id: '',
        progression: Progression.Preparation,
        question,
        questionId: '',
        severity: Severity.High,
        text: 'answer1',
        answeredBy: participant,
    }

    const answer2: Answer = {
        createDate: new Date(),
        id: '',
        progression: Progression.Individual,
        question,
        questionId: '',
        severity: Severity.High,
        text: 'answer2',
        answeredBy: participant,
    }

    const answer3: Answer = {
        createDate: new Date(),
        id: '',
        progression: Progression.Workshop,
        question,
        questionId: '',
        severity: Severity.Low,
        text: 'answer3',
        answeredBy: facilitator1,
    }

    const answer4: Answer = {
        createDate: new Date(),
        id: '',
        progression: Progression.Workshop,
        question,
        questionId: '',
        severity: Severity.Limited,
        text: 'answer4',
        answeredBy: facilitator2,
    }

    const answer5: Answer = {
        createDate: new Date(),
        id: '',
        progression: Progression.Individual,
        question,
        questionId: '',
        severity: Severity.Low,
        text: 'answer5',
        answeredBy: participant2,
    }
})
