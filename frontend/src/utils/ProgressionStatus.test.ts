import { Progression } from '../api/models'
import { calcProgressionStatus, progressionGreaterThan, progressionLessThan, ProgressionStatus } from "./ProgressionStatus"

describe('Test Progression status', () => {
    it('Same', () => {
        expect(calcProgressionStatus(Progression.Nomination, Progression.Nomination)).toBe(ProgressionStatus.InProgress)
    }),

    it('Correct order awaiting', () => {
        expect(calcProgressionStatus(Progression.Nomination, Progression.IndividualAssessment)).toBe(ProgressionStatus.Awaiting)
        expect(calcProgressionStatus(Progression.IndividualAssessment, Progression.Alignment)).toBe(ProgressionStatus.Awaiting)
        expect(calcProgressionStatus(Progression.Alignment, Progression.Workshop)).toBe(ProgressionStatus.Awaiting)
        expect(calcProgressionStatus(Progression.Workshop, Progression.FollowUp)).toBe(ProgressionStatus.Awaiting)
    }),

    it('Correct order complete', () => {
        expect(calcProgressionStatus(Progression.IndividualAssessment, Progression.Nomination)).toBe(ProgressionStatus.Complete)
        expect(calcProgressionStatus(Progression.Alignment, Progression.IndividualAssessment)).toBe(ProgressionStatus.Complete)
        expect(calcProgressionStatus(Progression.Workshop, Progression.Alignment)).toBe(ProgressionStatus.Complete)
        expect(calcProgressionStatus(Progression.FollowUp, Progression.Workshop)).toBe(ProgressionStatus.Complete)
    })
})

describe('Test Progression', () => {
    it('Correct progression order progressionLessThan', () => {
        expect(progressionLessThan(Progression.Nomination, Progression.IndividualAssessment)).toBe(true)
        expect(progressionLessThan(Progression.IndividualAssessment, Progression.Alignment)).toBe(true)
        expect(progressionLessThan(Progression.Alignment, Progression.Workshop)).toBe(true)
        expect(progressionLessThan(Progression.Workshop, Progression.FollowUp)).toBe(true)

        expect(progressionLessThan(Progression.IndividualAssessment, Progression.Nomination)).toBe(false)
        expect(progressionLessThan(Progression.Alignment, Progression.IndividualAssessment)).toBe(false)
        expect(progressionLessThan(Progression.Workshop, Progression.Alignment)).toBe(false)
        expect(progressionLessThan(Progression.FollowUp, Progression.Workshop)).toBe(false)
    })
    it('Correct progression order progressionGreaterThan', () => {
        expect(progressionGreaterThan(Progression.Nomination, Progression.IndividualAssessment)).toBe(false)
        expect(progressionGreaterThan(Progression.IndividualAssessment, Progression.Alignment)).toBe(false)
        expect(progressionGreaterThan(Progression.Alignment, Progression.Workshop)).toBe(false)
        expect(progressionGreaterThan(Progression.Workshop, Progression.FollowUp)).toBe(false)

        expect(progressionGreaterThan(Progression.IndividualAssessment, Progression.Nomination)).toBe(true)
        expect(progressionGreaterThan(Progression.Alignment, Progression.IndividualAssessment)).toBe(true)
        expect(progressionGreaterThan(Progression.Workshop, Progression.Alignment)).toBe(true)
        expect(progressionGreaterThan(Progression.FollowUp, Progression.Workshop)).toBe(true)
    })
})
