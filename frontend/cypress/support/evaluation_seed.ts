import { Progression, Question, Role } from '../../src/api/models'
import { User, getUsers } from './mock/external/users'
import { evaluationName } from './helpers'
import { createParticipant } from './mocks'
import { Answer, Action, createAction, Participant, Note, Summary } from './mocks'
import {
    GET_PROJECT,
    ADD_EVALUATION,
    PROGRESS_EVALUATION,
    SET_ANSWER,
    ADD_PARTICIPANT,
    CREATE_ACTION,
    EDIT_ACTION,
    CREATE_NOTE,
    SET_SUMMARY,
    PROGRESS_PARTICIPANT,
} from './gql'

type EvaluationSeedInput = {
    progression: Progression
    users: User[]
    fusionProjectId?: string
    namePrefix?: string
}

/**
 * Create a an evalutation in the database from testdata.
 *
 * The class EvaluationSeed is a specification for the testdata.
 * EvaluationSeed provides methods for adding testdata.
 * Creation of randomized testdata is left to methods defined outside this class.
 * NOTE: The method AddParticipant enforces that the first participant
 * has the role facilitator. See documentation of plant() method for more.
 * The constructor of EvaluationSeed calls addParticipant to create participants from the users.
 *
 *
 * Example usage:
 *
 *      const seed = new EvaluationSeed({
 *          progression: Progression.Individual,
 *          users: getUsers(3)
 *      })
 *
 * 'seed' now contains 3 participants each backed by a mocked AD user.
 * To 'seed' answers, notes, actions and summary can be added.
 *
 * When you are done constructing the testdata for the Evaluation, it's time to
 * flush it to the database, by calling seed, a.k.a 'planting the seed'
 *
 *      seed.plant()
 *
 * This will create a new Evaluation in the backend DB and populate it for you.
 * You are now ready to write your test.
 *
 *
 * Warning
 * -------
 *
 * The responsibility for creating sensible Evaluation seeds are left to the
 * user of this class.  This class _does not_ sanitize the evaluation state
 * that's being set up. This means it's perfectly possible to create illogical
 * states. E.g. you can create an Action even though the Evaluation - and all the
 * participants,  are at progression.Individual. The rationale for this is that
 * implementing sanitizers will basically mean re-implementing the behaviour of
 * the application, which is error-prone and can easily get out-of-sync.
 */
export class EvaluationSeed {
    readonly name: string
    fusionProjectId: string
    projectId: string = ''
    evaluationId: string = ''

    progression: Progression
    summary: Summary | undefined = undefined
    participants: Participant[] = []
    answers: Answer[] = []
    notes: Note[] = []
    actions: Action[] = []
    questions: Question[] = []

    constructor({ progression, users, fusionProjectId = '123', namePrefix = 'Evaluation' }: EvaluationSeedInput) {
        this.progression = progression
        let participants: Participant[] = []

        users.forEach(u => {
            participants.push(this.createParticipant({ user: u, progression: progression }))
        })
        participants.forEach(p => this.addParticipant(p))

        this.fusionProjectId = fusionProjectId
        this.name = evaluationName({ prefix: namePrefix })
    }

    addParticipant(participant: Participant) {
        // The first participant is always a facilitator
        if (this.participants.length == 0) {
            participant.role = Role.Facilitator
        }
        this.participants.push(participant)
        return this
    }

    addAnswer(answer: Answer) {
        this.answers.push(answer)
        return this
    }

    addAction(action: Action) {
        this.actions.push(action)
        return this
    }

    addNote(note: Note) {
        this.notes.push(note)
        return this
    }

    addSummary(summary: Summary) {
        this.summary = summary
        return this
    }

    public createAction = createAction

    public createParticipant = createParticipant

    findQuestionId(order: number) {
        const question = this.questions.find(x => x.order === order)
        if (question === undefined) {
            throw new RangeError('No such question')
        }
        return question.id
    }

    /** Plant the seed
     *
     * After setting up a valid seed (state) for an Evaluation, we need to feed
     * it to our database. plant() will do so by posting GraphQL mutations in
     * the following order:
     *
     *      login(...)
     *      CreateEvaluation(...)
     *      ProgressEvaluation(...)
     *
     *      for participant in this.participants:
     *          createParticipant(...)
     *          progressParticipant(...)
     *
     *      for answer in this.answers:
     *          login(...)
     *          setAnswer(...)
     *
     *      for action in this.actions:
     *          login(...)
     *          createAction(...)
     *
     *      for note in action.notes:
     *          login(...)
     *          createNote(...)
     *
     *      login(...)
     *      setSummary(...)
     *      login(...)
     *
     *
     *  Mutations for setting answers, actions, notes and evaluation summary
     *  don't explicitly include the creator of the element. In these cases
     *  the backend uses the JWT token to find the identity of the creator.
     *  This means that we have to login to the correct users before POSTing
     *  these mutations.
     *
     *  Note that multiple invocations of plant() will populate the database
     *  again.
     */
    plant() {
        return populateDB(this)
    }
}

const populateDB = (seed: EvaluationSeed) => {
    if (seed.participants === undefined || seed.participants.length < 1 || seed.participants[0].role !== Role.Facilitator) {
        throw Error('First participant is not Facilitator')
    }
    return cy
        .login(seed.participants[0].user)
        .then(() => {
            return cy.gql(GET_PROJECT, { variables: { fusionProjectId: seed.fusionProjectId } })
        })
        .then(res => {
            seed.projectId = res.body.data.project.id

            cy.log(`EvaluationSeed: Creating Evaluation by ${seed.participants[0].user}`)
            cy.gql(ADD_EVALUATION, { variables: { name: seed.name, projectId: seed.projectId } }).then(res => {
                const evaluation = res.body.data.createEvaluation
                seed.evaluationId = evaluation.id
                seed.questions = evaluation.questions
                seed.participants[0].id = evaluation.participants[0].id
            })
        })
        .then(e => {
            cy.log(`EvaluationSeed: Progressing Evaluation to ${seed.progression}`)
            cy.gql(PROGRESS_EVALUATION, {
                variables: {
                    evaluationId: seed.evaluationId,
                    newProgression: seed.progression,
                },
            })
        })
        .then(() => {
            cy.log(`EvaluationSeed: Progressing evaluation for creator ${seed.participants[0].user}`)
            cy.gql(PROGRESS_PARTICIPANT, {
                variables: {
                    evaluationId: seed.evaluationId,
                    newProgression: seed.participants[0].progression,
                },
            })
        })
        .then(() => {
            return seed.participants.slice(1)
        })
        .each((participant: Participant) => {
            cy.log(`EvaluationSeed: Adding and progressing additional Participants`)
            return cy
                .gql(ADD_PARTICIPANT, {
                    variables: {
                        azureUniqueId: participant.user.id,
                        evaluationId: seed.evaluationId,
                        organization: participant.organization,
                        role: participant.role,
                    },
                })
                .then(res => {
                    participant.id = res.body.data.createParticipant.id
                    cy.login(participant.user).then(() => {
                        cy.gql(PROGRESS_PARTICIPANT, {
                            variables: {
                                evaluationId: seed.evaluationId,
                                newProgression: participant.progression,
                            },
                        })
                    })
                })
        })
        .then(() => {
            return seed.answers
        })
        .each((answer: Answer) => {
            cy.login(answer.answeredBy.user).then(() => {
                cy.log(`EvaluationSeed: Adding Answer`)
                cy.gql(SET_ANSWER, {
                    variables: {
                        questionId: seed.findQuestionId(answer.questionOrder),
                        severity: answer.severity,
                        text: answer.text,
                        progression: answer.progression,
                    },
                })
            })
        })
        .then(() => {
            return seed.actions
        })
        .each((action: Action) => {
            cy.login(action.createdBy.user)
                .then(() => {
                    cy.log(`EvaluationSeed: Adding Action`)
                    cy.gql(CREATE_ACTION, {
                        variables: {
                            questionId: seed.findQuestionId(action.questionOrder),
                            assignedToId: action.assignedTo.id,
                            description: action.description,
                            dueDate: action.dueDate,
                            priority: action.priority,
                            title: action.title,
                        },
                    })
                })
                .then(res => {
                    action.id = res.body.data.createAction.id
                })
                .then(() => {
                    cy.log(`EvaluationSeed: Editing Action`)
                    cy.gql(EDIT_ACTION, {
                        variables: {
                            actionId: action.id,
                            completed: action.completed,
                            onHold: action.onHold,
                            assignedToId: action.assignedTo.id,
                            description: action.description,
                            dueDate: action.dueDate,
                            priority: action.priority,
                            title: action.title,
                        },
                    })
                })
        })
        .then(() => {
            return seed.notes
        })
        .each((note: Note) => {
            cy.login(note.createdBy.user).then(() => {
                cy.log(`EvaluationSeed: Adding Note`)
                cy.gql(CREATE_NOTE, {
                    variables: {
                        text: note.text,
                        actionId: note.action.id,
                    },
                })
            }) // TODO: save note Id if useful
        })
        .then(() => {
            if (seed.summary !== undefined) {
                cy.login(seed.summary.createdBy.user).then(() => {
                    cy.log(`EvaluationSeed: Setting summary to: ${seed.summary!.summary}`)
                    cy.gql(SET_SUMMARY, {
                        variables: {
                            evaluationId: seed.evaluationId,
                            summary: seed.summary!.summary,
                        },
                    })
                })
            }
        })
        .then(() => {
            cy.login(seed.participants[0].user)
        })
}
