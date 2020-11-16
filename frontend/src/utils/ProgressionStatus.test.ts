import { Progression } from '../api/models'
import { calcProgressionStatus, ProgressionStatus } from "./ProgressionStatus"

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
