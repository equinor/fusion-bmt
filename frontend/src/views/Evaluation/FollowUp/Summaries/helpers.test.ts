import { Progression, Question } from '../../../../api/models'
import { assignAnswerToBarrierQuestions } from './helpers'

const workshopAnswerSomeConcerns = {
    progression: 'WORKSHOP',
    severity: 'SOME_CONCERNS',
    text: 'Answer to the question',
}

const workshopAnswerMajorIssues = {
    progression: 'WORKSHOP',
    severity: 'MAJOR_ISSUES',
    text: 'Answer to the question',
}

const workshopAnswerOnTrack = {
    progression: 'WORKSHOP',
    severity: 'ON_TRACK',
    text: 'Answer to the question',
}

const followUpAnswerOnTrack = {
    progression: 'FOLLOW_UP',
    severity: 'ON_TRACK',
    text: 'Answer to the question',
}

const followUpAnswerSomeConcerns = {
    progression: 'FOLLOW_UP',
    severity: 'SOME_CONCERNS',
    text: 'Answer to the question',
}

const followUpAnswerMajorIssues = {
    progression: 'FOLLOW_UP',
    severity: 'MAJOR_ISSUES',
    text: 'Answer to the question',
}

const otherAnswers = [
    {
        progression: 'INDIVIDUAL',
        severity: 'OnTrack',
        text: 'Answer to the question',
    },
    {
        progression: 'PREPARATION',
        severity: 'OnTrack',
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
        answers: [workshopAnswerSomeConcerns, followUpAnswerOnTrack, ...otherAnswers],
    },
    {
        barrier: 'GM',
        answers: [workshopAnswerMajorIssues, followUpAnswerSomeConcerns, ...otherAnswers],
    },
    {
        barrier: 'PS4',
        answers: [workshopAnswerOnTrack, followUpAnswerMajorIssues, ...otherAnswers],
    },
]

const questionsWithSeveralAnswersOnSameBarrier = [
    {
        barrier: 'GM',
        answers: [workshopAnswerMajorIssues, workshopAnswerSomeConcerns, followUpAnswerOnTrack, ...otherAnswers],
    },
    {
        barrier: 'GM',
        answers: [workshopAnswerOnTrack, workshopAnswerMajorIssues, followUpAnswerSomeConcerns, ...otherAnswers],
    },
    {
        barrier: 'PS4',
        answers: [workshopAnswerMajorIssues, workshopAnswerOnTrack, followUpAnswerMajorIssues, ...otherAnswers],
    },
]

const questionsWithNoAnswerOnWorkshopGM = [
    {
        barrier: 'GM',
        answers: [followUpAnswerOnTrack, ...otherAnswers],
    },
    {
        barrier: 'GM',
        answers: [followUpAnswerSomeConcerns, ...otherAnswers],
    },
    {
        barrier: 'PS4',
        answers: [workshopAnswerMajorIssues, followUpAnswerMajorIssues, ...otherAnswers],
    },
]

test('assignAnswerToBarrierQuestions only returns questions from the step progression that is sent as parameter', () => {
    expect(assignAnswerToBarrierQuestions(<Question[]>questions, Progression.Workshop)).toEqual([
        { barrier: 'GM', answers: [workshopAnswerSomeConcerns, workshopAnswerMajorIssues] },
        ...emptyBarrierAnswersPS1To3,
        { barrier: 'PS4', answers: [workshopAnswerOnTrack] },
        ...emptyBarrierAnswersPS6To22,
    ])
    expect(assignAnswerToBarrierQuestions(<Question[]>questions, Progression.FollowUp)).toEqual([
        { barrier: 'GM', answers: [followUpAnswerOnTrack, followUpAnswerSomeConcerns] },
        ...emptyBarrierAnswersPS1To3,
        { barrier: 'PS4', answers: [followUpAnswerMajorIssues] },
        ...emptyBarrierAnswersPS6To22,
    ])
})

test('assignAnswerToBarrierQuestions returns one answer for each question, even if there exist more', () => {
    expect(assignAnswerToBarrierQuestions(<Question[]>questionsWithSeveralAnswersOnSameBarrier, Progression.Workshop)).toEqual([
        { barrier: 'GM', answers: [workshopAnswerMajorIssues, workshopAnswerOnTrack] },
        ...emptyBarrierAnswersPS1To3,
        { barrier: 'PS4', answers: [workshopAnswerMajorIssues] },
        ...emptyBarrierAnswersPS6To22,
    ])
})

test('assignAnswerToBarrierQuestions returns null in the place of the answer if no answer with the correct step progression is sent', () => {
    expect(assignAnswerToBarrierQuestions(<Question[]>questionsWithNoAnswerOnWorkshopGM, Progression.Workshop)).toEqual([
        { barrier: 'GM', answers: [null, null] },
        ...emptyBarrierAnswersPS1To3,
        { barrier: 'PS4', answers: [workshopAnswerMajorIssues] },
        ...emptyBarrierAnswersPS6To22,
    ])
})
