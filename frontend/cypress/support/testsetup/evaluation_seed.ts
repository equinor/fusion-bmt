import { Organization, Progression, ProjectCategory, Question, Role, Status } from '../../../src/api/models'
import { User } from '../mock/external/users'
import { evaluationName } from '../helpers/helpers'
import { createAction } from './testdata'
import { Answer, Action, Participant, Note, Summary, Evaluation, QuestionTemplate } from './mocks'
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
    GET_PROJECT_CATEGORY,
    GET_EVALUATIONS,
    GET_QUESTION_TEMPLATES,
    GET_ALL_PROJECT_CATEGORY_NAMES,
} from './gql'
import { fusionProject1 } from '../mock/external/projects'

type EvaluationSeedInput = {
    progression: Progression
    users: User[]
    roles: Role[]
    projectCategory?: string
    fusionProjectId: string
    namePrefix?: string
}

/**
 * Create a an evalutation in the database from testdata.
 *
 * The class EvaluationSeed is a specification for the testdata.
 * EvaluationSeed provides methods for adding testdata.
 * Creation of randomized testdata is left to methods defined outside this class.
 *
 * When you are done constructing the testdata for the Evaluation, it's time to
 * flush it to the database, by calling seed, a.k.a 'planting the seed'
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
    projectCategory: string

    progression: Progression
    summary: Summary | undefined = undefined
    participants: Participant[] = []
    answers: Answer[] = []
    notes: Note[] = []
    actions: Action[] = []
    questions: Question[] = []

    constructor({
        progression,
        users,
        roles,
        projectCategory = 'CircleField',
        fusionProjectId = fusionProject1.id,
        namePrefix = 'Evaluation',
    }: EvaluationSeedInput) {
        this.progression = progression
        let participants: Participant[] = []

        if (roles.length !== users.length) {
            throw new Error('EvaluationSeed: roles.length != users.length')
        }
        users.forEach((u, index) => {
            const r = roles[index]
            participants.push(
                new Participant({
                    user: u,
                    role: r,
                    organization: Organization.All,
                    progression: progression,
                })
            )
        })

        participants.forEach(p => this.addParticipant(p))
        this.projectCategory = projectCategory
        this.fusionProjectId = fusionProjectId
        this.name = evaluationName({ prefix: namePrefix })
    }

    addParticipant(participant: Participant) {
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

    findQuestionId(order: number) {
        const question = this.questions.find(x => x.order === order)
        if (question === undefined) {
            throw new RangeError('No such question')
        }
        return question.id
    }

    findParticipantByRole(desiredRole: Role) {
        const participant = this.participants.find(x => {
            return x.role === desiredRole
        })
        if (participant === undefined) {
            throw 'No user with role ' + desiredRole + ' found'
        }
        return participant
    }

    plant() {
        const facilitator = this.participants.find(e => e.role === Role.Facilitator)
        if (facilitator === undefined) {
            throw Error('Facilitator not found')
        }
        return populateDB(this, facilitator)
    }
}

const populateDB = (seed: EvaluationSeed, facilitator: Participant) => {
    return cy
        .login(facilitator.user)
        .then(() => {
            return cy.gql(GET_PROJECT, { variables: { fusionProjectId: seed.fusionProjectId } })
        })
        .then(res => {
            seed.projectId = res.body.data.project.id
            return cy.gql(GET_PROJECT_CATEGORY, { variables: { name: seed.projectCategory } })
        })
        .then(res => {
            const projectCategoryId = res.body.data.projectCategory[0].id
            cy.log(`EvaluationSeed: Creating Evaluation by ${facilitator.user}`)
            cy.gql(ADD_EVALUATION, {
                variables: { name: seed.name, projectId: seed.projectId, projectCategoryId: projectCategoryId },
            }).then(res => {
                const evaluation = res.body.data.createEvaluation
                seed.evaluationId = evaluation.id
                seed.questions = evaluation.questions
                seed.participants[seed.participants.indexOf(facilitator)].id =
                    evaluation.participants[seed.participants.indexOf(facilitator)].id
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
            return seed.participants.filter(x => x !== facilitator)
        })
        .each((participant: Participant) => {
            cy.log(`EvaluationSeed: Adding Participants`)
            cy.gql(ADD_PARTICIPANT, {
                variables: {
                    azureUniqueId: participant.user.id,
                    evaluationId: seed.evaluationId,
                    organization: participant.organization,
                    role: participant.role,
                },
            }).then(res => {
                participant.id = res.body.data.createParticipant.id
            })
        })
        .then(() => {
            return seed.participants
        })
        .each((participant: Participant) => {
            cy.login(participant.user).then(() => {
                cy.log(`EvaluationSeed: Progressing Participant`)
                cy.gql(PROGRESS_PARTICIPANT, {
                    variables: {
                        evaluationId: seed.evaluationId,
                        newProgression: participant.progression,
                    },
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
            cy.login(facilitator.user)
        })
}

export function evaluation(name: string): Cypress.Chainable<Evaluation> {
    return cy.gql(GET_EVALUATIONS, { variables: {} }).then(res => {
        const allEvaluations: Array<Evaluation> = res.body.data.evaluations
        return allEvaluations.find(e => e.name === name)
    })
}

export function activeQuestionTemplates(projectCategory?: string): Cypress.Chainable<Array<QuestionTemplate>> {
    return cy.gql(GET_QUESTION_TEMPLATES, { variables: {} }).then(res => {
        const templates: Array<QuestionTemplate> = res.body.data.questionTemplates
        const activeTemplate: Array<QuestionTemplate> = templates.filter(t => t.status === Status.Active)
        if (projectCategory === undefined) {
            return activeTemplate
        }
        return activeTemplate.filter(x => {
            const projectCategories: Array<ProjectCategory> = x.projectCategories
            return projectCategories.find(y => y.name === projectCategory)
        })
    })
}

export function projectCategoryId(categoryName: string): Cypress.Chainable<string> {
    return cy.gql(GET_PROJECT_CATEGORY, { variables: { name: categoryName } }).then(res => {
        const id = res.body.data.projectCategory?.[0].id

        return id
    })
}

export function allProjectCategoryNames(): Cypress.Chainable<Array<string>> {
    return cy.gql(GET_ALL_PROJECT_CATEGORY_NAMES, { variables: {} }).then(res => {
        interface pname {
            name: string
        }
        const nameArray: Array<pname> = res.body.data.projectCategory
        var returnVal = nameArray.map(v => v.name)
        return returnVal
    })
}

export function progressEvaluation(evaluationId: string, newProgression: string): Cypress.Chainable {
    return cy.gql(PROGRESS_EVALUATION, {
        variables: {
            evaluationId: evaluationId,
            newProgression: newProgression,
        },
    })
}
