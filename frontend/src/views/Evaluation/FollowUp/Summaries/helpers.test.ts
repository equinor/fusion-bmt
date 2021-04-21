import { Progression, Question } from '../../../../api/models'
import { assignAnswerToBarrierQuestions } from './helpers'

const workshopAnswerLimited = {
    progression: 'WORKSHOP',
    severity: 'LIMITED',
    text: 'Answer to the question',
}

const workshopAnswerLow = {
    progression: 'WORKSHOP',
    severity: 'LOW',
    text: 'Answer to the question',
}

const workshopAnswerHigh = {
    progression: 'WORKSHOP',
    severity: 'HIGH',
    text: 'Answer to the question',
}

const followUpAnswerHigh = {
    progression: 'FOLLOW_UP',
    severity: 'HIGH',
    text: 'Answer to the question',
}

const followUpAnswerLimited = {
    progression: 'FOLLOW_UP',
    severity: 'LIMITED',
    text: 'Answer to the question',
}

const followUpAnswerLow = {
    progression: 'FOLLOW_UP',
    severity: 'LOW',
    text: 'Answer to the question',
}

const otherAnswers = [
    {
        progression: 'INDIVIDUAL',
        severity: 'HIGH',
        text: 'Answer to the question',
    },
    {
        progression: 'PREPARATION',
        severity: 'HIGH',
        text: 'Answer to the question',
    },
]

const emptyBarrierAnswersPS1To3 = [
    { barrier: 'PS1', answers: [] },
    { barrier: 'PS2', answers: [] },
    { barrier: 'PS3', answers: [] },
]

const emptyBarrierAnswersPS6To22 = [
    { barrier: 'PS6', answers: [] },
    { barrier: 'PS7', answers: [] },
    { barrier: 'PS12', answers: [] },
    { barrier: 'PS15', answers: [] },
    { barrier: 'PS22', answers: [] },
]

const questions = [
    {
        barrier: 'GM',
        answers: [workshopAnswerLimited, followUpAnswerHigh, ...otherAnswers],
    },
    {
        barrier: 'GM',
        answers: [workshopAnswerLow, followUpAnswerLimited, ...otherAnswers],
    },
    {
        barrier: 'PS4',
        answers: [workshopAnswerHigh, followUpAnswerLow, ...otherAnswers],
    },
]

const questionsWithSeveralAnswersOnSameBarrier = [
    {
        barrier: 'GM',
        answers: [workshopAnswerLow, workshopAnswerLimited, followUpAnswerHigh, ...otherAnswers],
    },
    {
        barrier: 'GM',
        answers: [workshopAnswerHigh, workshopAnswerLow, followUpAnswerLimited, ...otherAnswers],
    },
    {
        barrier: 'PS4',
        answers: [workshopAnswerLow, workshopAnswerHigh, followUpAnswerLow, ...otherAnswers],
    },
]

const questionsWithNoAnswerOnWorkshopGM = [
    {
        barrier: 'GM',
        answers: [followUpAnswerHigh, ...otherAnswers],
    },
    {
        barrier: 'GM',
        answers: [followUpAnswerLimited, ...otherAnswers],
    },
    {
        barrier: 'PS4',
        answers: [workshopAnswerLow, followUpAnswerLow, ...otherAnswers],
    },
]

test('assignAnswerToBarrierQuestions only returns questions from the step progression that is sent as parameter', () => {
    expect(assignAnswerToBarrierQuestions(<Question[]>questions, Progression.Workshop)).toEqual([
        { barrier: 'GM', answers: [workshopAnswerLimited, workshopAnswerLow] },
        ...emptyBarrierAnswersPS1To3,
        { barrier: 'PS4', answers: [workshopAnswerHigh] },
        ...emptyBarrierAnswersPS6To22,
    ])
    expect(assignAnswerToBarrierQuestions(<Question[]>questions, Progression.FollowUp)).toEqual([
        { barrier: 'GM', answers: [followUpAnswerHigh, followUpAnswerLimited] },
        ...emptyBarrierAnswersPS1To3,
        { barrier: 'PS4', answers: [followUpAnswerLow] },
        ...emptyBarrierAnswersPS6To22,
    ])
})

test('assignAnswerToBarrierQuestions returns one answer for each question, even if there exist more', () => {
    expect(assignAnswerToBarrierQuestions(<Question[]>questionsWithSeveralAnswersOnSameBarrier, Progression.Workshop)).toEqual([
        { barrier: 'GM', answers: [workshopAnswerLow, workshopAnswerHigh] },
        ...emptyBarrierAnswersPS1To3,
        { barrier: 'PS4', answers: [workshopAnswerLow] },
        ...emptyBarrierAnswersPS6To22,
    ])
})

test('assignAnswerToBarrierQuestions returns null in the place of the answer if no answer with the correct step progression is sent', () => {
    expect(assignAnswerToBarrierQuestions(<Question[]>questionsWithNoAnswerOnWorkshopGM, Progression.Workshop)).toEqual([
        { barrier: 'GM', answers: [null, null] },
        ...emptyBarrierAnswersPS1To3,
        { barrier: 'PS4', answers: [workshopAnswerLow] },
        ...emptyBarrierAnswersPS6To22,
    ])
})
