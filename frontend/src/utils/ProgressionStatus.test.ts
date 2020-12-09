import { Progression } from '../api/models'
import { calcProgressionStatus, progressionLessThan, ProgressionStatus } from "./ProgressionStatus"

describe('Test Progression status', () => {
    it('Same', () => {
        expect(calcProgressionStatus(Progression.Nomination, Progression.Nomination)).toBe(ProgressionStatus.InProgress)
    }),

    it('Correct order awaiting', () => {
        expect(calcProgressionStatus(Progression.Nomination, Progression.Preparation)).toBe(ProgressionStatus.Awaiting)
        expect(calcProgressionStatus(Progression.Preparation, Progression.Alignment)).toBe(ProgressionStatus.Awaiting)
        expect(calcProgressionStatus(Progression.Alignment, Progression.Workshop)).toBe(ProgressionStatus.Awaiting)
        expect(calcProgressionStatus(Progression.Workshop, Progression.FollowUp)).toBe(ProgressionStatus.Awaiting)
    }),

    it('Correct order complete', () => {
        expect(calcProgressionStatus(Progression.Preparation, Progression.Nomination)).toBe(ProgressionStatus.Complete)
        expect(calcProgressionStatus(Progression.Alignment, Progression.Preparation)).toBe(ProgressionStatus.Complete)
        expect(calcProgressionStatus(Progression.Workshop, Progression.Alignment)).toBe(ProgressionStatus.Complete)
        expect(calcProgressionStatus(Progression.FollowUp, Progression.Workshop)).toBe(ProgressionStatus.Complete)
    })
})

describe('Test Progression', () => {
    it('Correct progression order', () => {
        expect(progressionLessThan(Progression.Nomination, Progression.Preparation)).toBe(true)
        expect(progressionLessThan(Progression.Preparation, Progression.Alignment)).toBe(true)
        expect(progressionLessThan(Progression.Alignment, Progression.Workshop)).toBe(true)
        expect(progressionLessThan(Progression.Workshop, Progression.FollowUp)).toBe(true)

        expect(progressionLessThan(Progression.Preparation, Progression.Nomination)).toBe(false)
        expect(progressionLessThan(Progression.Alignment, Progression.Preparation)).toBe(false)
        expect(progressionLessThan(Progression.Workshop, Progression.Alignment)).toBe(false)
        expect(progressionLessThan(Progression.FollowUp, Progression.Workshop)).toBe(false)
    })
})
