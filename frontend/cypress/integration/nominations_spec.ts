import { EvaluationSeed } from '../support/evaluation_seed'
import { Progression, Role } from '../../src/api/models'
import { Participant } from '../support/mocks'
import NominationPage from '../support/nomination'
import { getUsers } from '../support/mock/external/users'
import * as faker from 'faker'
import { EvaluationPage } from '../support/evaluation'
describe('User management', () => {
    describe('Nomination stage', () => {
        let seed: EvaluationSeed
        before(() => {
            seed = createSeed()
            seed.plant()
        })
        context('Adding and deleting users, finishing nomination', () => {
            const nominationPage = new NominationPage()
            const userCapabilities = [
                {
                    role: Role.Facilitator,
                    canAddUser: true,
                    canDeleteUser: true,
                    canProgressEval: true,
                },
                {
                    role: Role.OrganizationLead,
                    canAddUser: true,
                    canDeleteUser: true,
                    canProgressEval: false,
                },
                {
                    role: Role.Participant,
                    canAddUser: false,
                    canDeleteUser: false,
                    canProgressEval: false,
                },
                {
                    role: Role.ReadOnly,
                    canAddUser: false,
                    canDeleteUser: false,
                    canProgressEval: false,
                },
            ]

            userCapabilities.forEach(e => {
                it(`${e.role} can delete user = ${e.canDeleteUser}, add user = ${e.canAddUser}, progress nomination = ${e.canProgressEval}`, () => {
                    let p = findRandomParticipant(seed, e.role)
                    cy.visitEvaluation(seed.evaluationId, p.user)
                    verifyUserManagementCapabilities(nominationPage, seed.participants, p, e.canAddUser, e.canDeleteUser, e.canProgressEval)
                })
            })

            it('TODO: A participant that is added is part of the evaluation', () => {
                // To be added
            })

            it('A participant that is deleted is no longer part of evaluation', () => {
                const role = faker.random.arrayElement([Role.Facilitator, Role.OrganizationLead])
                const p = findRandomParticipant(seed, role)
                cy.visitEvaluation(seed.evaluationId, p.user)
                const userToDelete = findRandomParticipant(seed, Role.Participant)
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
        let seed: EvaluationSeed
        before(() => {
            seed = createSeed(randomStage)
            seed.plant()
        })
        let randomStage = faker.random.arrayElement([
            Progression.Workshop,
            Progression.FollowUp,
            Progression.Individual,
            Progression.Preparation,
        ])
        context(`User management users at random stage ${randomStage}`, () => {
            const nominationPage = new NominationPage()
            const evaluationPage = new EvaluationPage()
            before(() => {
                seed = createSeed(randomStage)
                seed.plant()
            })
            const userCapabilites = [
                {
                    role: Role.Facilitator,
                    canAddUser: true,
                    canDeleteUser: false,
                    canProgressEval: false,
                },
                {
                    role: Role.OrganizationLead,
                    canAddUser: true,
                    canDeleteUser: false,
                    canProgressEval: false,
                },
                {
                    role: Role.Participant,
                    canAddUser: false,
                    canDeleteUser: false,
                    canProgressEval: false,
                },
                {
                    role: Role.ReadOnly,
                    canAddUser: false,
                    canDeleteUser: false,
                    canProgressEval: false,
                },
            ]

            userCapabilites.forEach(e => {
                it(`${e.role} can delete user = ${e.canDeleteUser}, can add user = ${e.canAddUser}`, () => {
                    let p = findRandomParticipant(seed, e.role)
                    cy.visitEvaluation(seed.evaluationId, p.user)
                    evaluationPage.progressionStepLink(Progression.Nomination).click()
                    verifyUserManagementCapabilities(nominationPage, seed.participants, p, e.canAddUser, e.canDeleteUser, e.canProgressEval)
                })
            })
        })
    })
})

function createSeed(progression: Progression = Progression.Nomination) {
    let users = getUsers(5)
    const seed = new EvaluationSeed({
        progression: progression,
        users,
    })
    seed.participants[1].role = Role.Facilitator
    seed.participants[2].role = Role.Participant
    seed.participants[3].role = Role.OrganizationLead
    seed.participants[4].role = Role.ReadOnly
    return seed
}

function findRandomParticipant(seed: EvaluationSeed, role: Role): Participant {
    let participants: Participant[] = seed.participants.filter(x => {
        return x.role === role
    })
    const participant = faker.random.arrayElement(participants)
    return participant
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
    allParticipants.forEach(p => {
        if (p === participant) {
            return
            // below line fails because the element does not exist and cy.get then fails on this element
            //nominationPage.deletePersonDiv(p.user).should('not.exist')
        }
        if (canDeleteUser) {
            nominationPage.deletePersonDiv(p.user).find('button').should('be.enabled')
        } else {
            nominationPage.deletePersonDiv(p.user).find('button').should('be.disabled')
        }
    })
}
