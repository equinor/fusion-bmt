import { EvaluationSeed } from '../support/testsetup/evaluation_seed'
import { Progression, Role, Status } from '../../src/api/models'
import { Participant } from '../support/testsetup/mocks'
import NominationPage from '../page_objects/nomination'
import * as faker from 'faker'
import { EvaluationPage } from '../page_objects/evaluation'
import { fusionProject1 } from '../support/mock/external/projects'
import { users, User, getUsers } from '../support/mock/external/users'

const nominationPage = new NominationPage()
const evaluationPage = new EvaluationPage()
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
        context(`User capabilities with evaluation at random stage ${randomStage}`, () => {
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
                    hideFromListBtnShould: 'be.visible',
                },
                {
                    role: Role.OrganizationLead,
                    deleteUserBtn: 'be.disabled',
                    addPersonBtnShould: 'be.enabled',
                    finishNominationBtnShould: 'not.exist',
                    hideFromListBtnShould: 'not.exist',
                },
                {
                    role: Role.Participant,
                    deleteUserBtn: 'be.disabled',
                    addPersonBtnShould: 'be.disabled',
                    finishNominationBtnShould: 'not.exist',
                    hideFromListBtnShould: 'not.exist',
                },
            ]

            userCapabilites.forEach(e => {
                it(`For ${e.role} Add person button should ${e.addPersonBtnShould.replace('.', ' ')},
                Delete user button should ${e.deleteUserBtn.replace('.', ' ')}
                Finish nomination button should ${e.finishNominationBtnShould.replace('.', ' ')}
                Hide from list button should ${e.hideFromListBtnShould.replace('.', ' ')},`, () => {
                    let p = findRandomParticipant(seed, e.role)
                    cy.visitEvaluation(seed.evaluationId, p.user, fusionProject1.id)
                    evaluationPage.progressionStepLink(Progression.Nomination).click()
                    nominationPage.addPersonButton().should(`${e.addPersonBtnShould}`)
                    nominationPage.finishNominationButton().should(`${e.finishNominationBtnShould}`)
                    nominationPage.hideEvaluationButton().should(`${e.hideFromListBtnShould}`)
                    deleteUserBtn(p, seed.participants, e.deleteUserBtn)
                })
            })

            it(`Admin should see button hide from list,
            when the Admin clicks the \'Hide from list\' button,
            then the button changes to \'Make visibible\' 
            and the status of the evaluation is VOIDED`, () => {
                let admin = findAdmin(users)
                cy.visitEvaluation(seed.evaluationId, admin, fusionProject1.id)
                evaluationPage.progressionStepLink(Progression.Nomination).click()
                nominationPage.hideEvaluationButton().should('be.visible')
                cy.intercept(/\/graphql/).as('graphql')
                nominationPage.hideEvaluationButton().click()
                cy.wait('@graphql').then(res => {
                    expect(res.response!.body.data.setEvaluationStatus.status, 'The status of the evaluation is VOIDED').to.equal(
                        Status.Voided
                    )
                })
                nominationPage.makeVisibleEvaluationButton().should('be.visible')
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

function findAdmin(users: Array<User>): User {
    const admin = users.find(x => x.roles.includes('Role.Admin'))
    return admin!
}

const deleteUserBtn = (participant: Participant, participants: Participant[], shouldBe: string) => {
    participants.forEach(p => {
        if (p === participant) {
            nominationPage.deletePersonDiv(p.user).should('not.exist')
        } else {
            nominationPage.deletePersonDiv(p.user).find('button').should(shouldBe)
        }
    })
}
