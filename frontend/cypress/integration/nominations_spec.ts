import { EvaluationSeed } from '../support/testsetup/evaluation_seed'
import { Progression, Role } from '../../src/api/models'
import { Participant } from '../support/testsetup/mocks'
import NominationPage from '../page_objects/nomination'
import { getUsers } from '../support/mock/external/users'
import * as faker from 'faker'
import { EvaluationPage } from '../page_objects/evaluation'
import { fusionProject1 } from '../support/mock/external/projects'

const nominationPage = new NominationPage()
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
                    deleteUserBtn: 'be.enabled',
                    addPersonBtnShould: 'be.enabled',
                    finishNominationBtnShould: 'be.enabled',
                },
                {
                    role: Role.OrganizationLead,
                    deleteUserBtn: 'be.enabled',
                    addPersonBtnShould: 'be.enabled',
                    finishNominationBtnShould: 'not.exist',
                },
                {
                    role: Role.Participant,
                    deleteUserBtn: 'be.disabled',
                    addPersonBtnShould: 'be.disabled',
                    finishNominationBtnShould: 'not.exist',
                },
            ]

            userCapabilities.forEach(e => {
                it(`For ${e.role} Add person btn should ${e.addPersonBtnShould.replace('.', ' ')},
                Delete user btn should ${e.deleteUserBtn.replace('.', ' ')}
                Finish nomination btn should ${e.finishNominationBtnShould.replace('.', ' ')},`, () => {
                    let p = findRandomParticipant(seed, e.role)
                    cy.visitEvaluation(seed.evaluationId, p.user, fusionProject1.id)
                    nominationPage.addPersonButton().should(`${e.addPersonBtnShould}`)
                    nominationPage.finishNominationButton().should(`${e.finishNominationBtnShould}`)
                    deleteUserBtn(p, seed.participants, e.deleteUserBtn)
                })
            })

            it('TODO: A participant that is added is part of the evaluation', () => {
                // To be added
            })

            it('A participant that is deleted is no longer part of evaluation', () => {
                const role = faker.random.arrayElement([Role.Facilitator, Role.OrganizationLead])
                const p = findRandomParticipant(seed, role)
                cy.visitEvaluation(seed.evaluationId, p.user, fusionProject1.id)
                const userToDelete = findRandomParticipant(seed, Role.Participant)
                nominationPage.deletePersonDiv(userToDelete.user).click()
                cy.visitEvaluation(seed.evaluationId, p.user, fusionProject1.id)
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
            const evaluationPage = new EvaluationPage()
            before(() => {
                seed = createSeed(randomStage)
                seed.plant()
            })
            const userCapabilites = [
                {
                    role: Role.Facilitator,
                    deleteUserBtn: 'be.disabled',
                    addPersonBtnShould: 'be.enabled',
                    finishNominationBtnShould: 'be.disabled',
                    canAddUser: true,
                    canDeleteUser: false,
                    canProgressEval: false,
                },
                {
                    role: Role.OrganizationLead,
                    deleteUserBtn: 'be.disabled',
                    addPersonBtnShould: 'be.enabled',
                    finishNominationBtnShould: 'not.exist',
                    canAddUser: true,
                    canDeleteUser: false,
                    canProgressEval: false,
                },
                {
                    role: Role.Participant,
                    deleteUserBtn: 'be.disabled',
                    addPersonBtnShould: 'be.disabled',
                    finishNominationBtnShould: 'not.exist',
                    canAddUser: false,
                    canDeleteUser: false,
                    canProgressEval: false,
                },
            ]

            userCapabilites.forEach(e => {
                it(`For ${e.role} Add person btn should ${e.addPersonBtnShould.replace('.', ' ')},
                Delete user btn should ${e.deleteUserBtn.replace('.', ' ')}
                Finish nomination btn should ${e.finishNominationBtnShould.replace('.', ' ')},`, () => {
                    let p = findRandomParticipant(seed, e.role)
                    cy.visitEvaluation(seed.evaluationId, p.user, fusionProject1.id)
                    evaluationPage.progressionStepLink(Progression.Nomination).click()
                    nominationPage.addPersonButton().should(`${e.addPersonBtnShould}`)
                    nominationPage.finishNominationButton().should(`${e.finishNominationBtnShould}`)
                    deleteUserBtn(p, seed.participants, e.deleteUserBtn)
                })
            })
        })
    })
})

function createSeed(progression: Progression = Progression.Nomination) {
    let users = getUsers(3)
    const roles = [Role.Facilitator, Role.Participant, Role.OrganizationLead]
    const seed = new EvaluationSeed({
        progression: progression,
        users,
        roles,
        fusionProjectId: fusionProject1.id,
    })
    return seed
}

function findRandomParticipant(seed: EvaluationSeed, role: Role): Participant {
    let participants: Participant[] = seed.participants.filter(x => {
        return x.role === role
    })
    const participant = faker.random.arrayElement(participants)
    return participant
}

const deleteUserBtn = (participant: Participant, participants: Participant[], shouldBe: string) => {
    participants.forEach(p => {
        if (p === participant) {
            return
            // below line fails because the element does not exist and cy.get then fails on this element
            //nominationPage.deletePersonDiv(p.user).find('button').should('not.exist')
        }
        nominationPage.deletePersonDiv(p.user).find('button').should(shouldBe)
    })
}
