import { EvaluationSeed } from '../support/evaluation_seed'
import { Organization, Priority, Progression, Severity } from '../../src/api/models'
import {Action, Answer, Note, Summary} from '../support/mocks'

const exampleSeed = () => {
    let seed = new EvaluationSeed(Progression.Workshop, 2)

    let facilitator = seed.participants[0]
    facilitator.progression = Progression.FollowUp
    let engineer = seed.participants[1]
    engineer.organization = Organization.Engineering

    const answerFacilitator = new Answer({
        questionOrder: 1,
        answeredBy: facilitator,
        progression: Progression.Workshop,
        text: "I have a nice answer to this question",
    })

    const answerEngineer = new Answer({
        questionOrder: 1,
        answeredBy: engineer,
        text: "I have a nice answer to this question",
        progression: Progression.Individual,
        severity: Severity.High,
    })

    const action = new Action({
        questionOrder: 1,
        assignedTo: engineer,
        createdBy: facilitator,
        dueDate: new Date(),
        title: "Action has a title",
        priority: Priority.High,
        description: "description is optional",
    })

    const note = new Note({
        text: "Note",
        action,
        createdBy: engineer
    })

    const summary = new Summary("sums it up", facilitator)

    seed.addAnswer(answerEngineer)
        .addAnswer(answerFacilitator)
        .addAction(action)
        .addNote(note)
        .addSummary(summary)

    return seed
}

describe('Let each "it" have its own instance of the same eval', () => {
    let seed: EvaluationSeed

    beforeEach( () => {
        seed = exampleSeed()

        /* Seed the database - then login to the user that created the Evaluation
         * and go to evaluation
         */
        seed.plant().then( () => {
            cy.visitEvaluation(seed.evaluationId, seed.participants[0].user)
        })
    })

    it('First test does something', () => {
        assert(true)
    })

    it('Second test gets a new instance from same seed', () => {
        assert(true)
    })
})

