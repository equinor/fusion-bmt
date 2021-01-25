import { Progression } from '../api/models'
import { calcProgressionStatus, progressionGreaterThan, progressionLessThan, ProgressionStatus } from './ProgressionStatus'

describe('Test Progression status', () => {
    it('Same', () => {
        expect(calcProgressionStatus(Progression.Nomination, Progression.Nomination)).toBe(ProgressionStatus.InProgress)
    }),
        it('Correct order awaiting', () => {
            expect(calcProgressionStatus(Progression.Nomination, Progression.Individual)).toBe(ProgressionStatus.Awaiting)
            expect(calcProgressionStatus(Progression.Individual, Progression.Preparation)).toBe(ProgressionStatus.Awaiting)
            expect(calcProgressionStatus(Progression.Preparation, Progression.Workshop)).toBe(ProgressionStatus.Awaiting)
            expect(calcProgressionStatus(Progression.Workshop, Progression.FollowUp)).toBe(ProgressionStatus.Awaiting)
        }),
        it('Correct order complete', () => {
            expect(calcProgressionStatus(Progression.Individual, Progression.Nomination)).toBe(ProgressionStatus.Complete)
            expect(calcProgressionStatus(Progression.Preparation, Progression.Individual)).toBe(ProgressionStatus.Complete)
            expect(calcProgressionStatus(Progression.Workshop, Progression.Preparation)).toBe(ProgressionStatus.Complete)
            expect(calcProgressionStatus(Progression.FollowUp, Progression.Workshop)).toBe(ProgressionStatus.Complete)
        })
})

describe('Test Progression', () => {
    it('Correct progression order progressionLessThan', () => {
        expect(progressionLessThan(Progression.Nomination, Progression.Individual)).toBe(true)
        expect(progressionLessThan(Progression.Individual, Progression.Preparation)).toBe(true)
        expect(progressionLessThan(Progression.Preparation, Progression.Workshop)).toBe(true)
        expect(progressionLessThan(Progression.Workshop, Progression.FollowUp)).toBe(true)

        expect(progressionLessThan(Progression.Individual, Progression.Nomination)).toBe(false)
        expect(progressionLessThan(Progression.Preparation, Progression.Individual)).toBe(false)
        expect(progressionLessThan(Progression.Workshop, Progression.Preparation)).toBe(false)
        expect(progressionLessThan(Progression.FollowUp, Progression.Workshop)).toBe(false)
    })
    it('Correct progression order progressionGreaterThan', () => {
        expect(progressionGreaterThan(Progression.Nomination, Progression.Individual)).toBe(false)
        expect(progressionGreaterThan(Progression.Individual, Progression.Preparation)).toBe(false)
        expect(progressionGreaterThan(Progression.Preparation, Progression.Workshop)).toBe(false)
        expect(progressionGreaterThan(Progression.Workshop, Progression.FollowUp)).toBe(false)

        expect(progressionGreaterThan(Progression.Individual, Progression.Nomination)).toBe(true)
        expect(progressionGreaterThan(Progression.Preparation, Progression.Individual)).toBe(true)
        expect(progressionGreaterThan(Progression.Workshop, Progression.Preparation)).toBe(true)
        expect(progressionGreaterThan(Progression.FollowUp, Progression.Workshop)).toBe(true)
    })
})
