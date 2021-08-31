import { EvaluationSeed } from '../support/evaluation_seed'
import { Progression, Role } from '../../src/api/models'
import { Participant } from '../support/mocks'
import NominationPage from '../support/nomination'
import { getUsers } from '../support/mock/external/users'
import * as faker from 'faker'
import StepperGrid from '../support/stepper_grid'
describe('User management', () => {
    describe('Nomination stage', () => {
        context('Adding and deleting users, finishing nomination', () => {
            let seed: EvaluationSeed
            const nominationPage = new NominationPage()
            before(() => {
                seed = createSeed()
                seed.plant()
            })
            ;[
                {
                    role: Role.Facilitator,
                    addUser: true,
                    deleteUser: true,
                    progressEval: true,
                },
                {
                    role: Role.OrganizationLead,
                    addUser: true,
                    deleteUser: true,
                    progressEval: false,
                },
                {
                    role: Role.Participant,
                    addUser: false,
                    deleteUser: false,
                    progressEval: false,
                },
            ].forEach(e => {
                it(`${e.role} can delete user = ${e.deleteUser}, add user = ${e.addUser}, progress nomination = ${e.progressEval}`, () => {
                    let p = seed.findRandomParticipant(e.role)
                    cy.visitEvaluation(seed.evaluationId, p.user)
                    verifyUserManagementCapabilities(nominationPage, seed.participants, p, e.addUser, e.deleteUser, e.progressEval)
                })
            })

            it('TODO: A participant that is added is part of the evaluation', () => {
                // To be added
            })

            it('A participant that is deleted is no longer part of evaluation', () => {
                const role = faker.random.arrayElement([Role.Facilitator, Role.OrganizationLead])
                const p = seed.findRandomParticipant(role)
                cy.visitEvaluation(seed.evaluationId, p.user)
                const userToDelete = seed.findRandomParticipant(Role.Participant)
                nominationPage.deletePersonDiv(userToDelete.user).click()
                cy.visitEvaluation(seed.evaluationId, p.user)
                nominationPage.assertParticipantPresent(p.user)
                nominationPage.assertParticipantAbsent(userToDelete.user)
            })

            it('TODO: When Facilitator progresses evaluation it moves to next stage', () => {
                // To be added
            })
        })
    })

    describe('After Nomination stage', () => {
        let randomStage = faker.random.arrayElement([
            Progression.Workshop,
            Progression.FollowUp,
            Progression.Individual,
            Progression.Preparation,
        ])
        context(`User management users at random stage ${randomStage}`, () => {
            let seed: EvaluationSeed
            const nominationPage = new NominationPage()
            const stepper_grid = new StepperGrid()
            before(() => {
                seed = createSeed(randomStage)
                seed.plant()
            })
            ;[
                {
                    role: Role.Facilitator,
                    addUser: true,
                    deleteUser: false,
                    progressEval: false,
                },
                {
                    role: Role.OrganizationLead,
                    addUser: true,
                    deleteUser: false,
                    progressEval: false,
                },
                {
                    role: Role.Participant,
                    addUser: false,
                    deleteUser: false,
                    progressEval: false,
                },
            ].forEach(e => {
                it(`${e.role} can delete user = ${e.deleteUser}, can add user = ${e.addUser}`, () => {
                    let p = seed.findRandomParticipant(e.role)
                    cy.visitEvaluation(seed.evaluationId, p.user)
                    stepper_grid.nomination().click()
                    verifyUserManagementCapabilities(nominationPage, seed.participants, p, e.addUser, e.deleteUser, e.progressEval)
                })
            })
        })
    })
})

function createSeed(progression: Progression = Progression.Nomination) {
    let users = getUsers(4)
    const seed = new EvaluationSeed({
        progression: progression,
        users,
    })
    seed.participants[1].role = Role.Facilitator
    seed.participants[2].role = Role.Participant
    seed.participants[3].role = Role.OrganizationLead
    return seed
}

function verifyUserManagementCapabilities(
    nominationPage: NominationPage,
    allParticipants: Participant[],
    participant: Participant,
    canAddUser: boolean,
    canDeleteUser: boolean,
    canProgressEval: boolean
) {
    if (canAddUser) {
        nominationPage.addPersonButton().should('be.enabled')
    } else {
        nominationPage.addPersonButton().should('be.disabled')
    }
    if (canProgressEval) {
        nominationPage.finishNominationButton().should('be.enabled')
    } else {
        nominationPage.finishNominationButton().should('be.disabled')
    }
    // Delete button never visible for user itself regardless of role
    nominationPage.deletePersonDiv(participant.user).should('not.exist')
    allParticipants.forEach(p => {
        if (p === participant) {
            return
        }
        if (canDeleteUser) {
            nominationPage.deletePersonDiv(p.user).find('button').should('be.enabled')
        } else {
            nominationPage.deletePersonDiv(p.user).find('button').should('be.disabled')
        }
    })
}
