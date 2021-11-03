import * as faker from 'faker'
import { Progression, Role, Status } from '../../src/api/models'
import { EvaluationSeed } from '../support/testsetup/evaluation_seed'
import { getUsers } from '../support/mock/external/users'
import { EvaluationPage } from '../page_objects/evaluation'
import { fusionProject1, fusionProject4 } from '../support/mock/external/projects'
import { ActionTable } from '../page_objects/action-table'
import { EditActionDialog } from '../page_objects/action'

describe('Landing page', () => {
    const users = getUsers(3)
    const roles = [Role.Facilitator, Role.OrganizationLead, Role.Participant]
    const user = users[2]
    const adminUser = getUsers(6)[5]
    const selectedProject = fusionProject1
    const otherProject = fusionProject4

    const myActiveEvaluationInProject = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users,
        roles,
        fusionProjectId: selectedProject.id,
        namePrefix: 'myEval',
    })
    myActiveEvaluationInProject
        .addAction(
            myActiveEvaluationInProject.createAction({
                completed: false,
                assignedTo: myActiveEvaluationInProject.participants.find(p => p.user === user),
                title: 'My action' + faker.lorem.words(),
                description: 'My action' + faker.lorem.words(),
            })
        )
        .addAction(
            myActiveEvaluationInProject.createAction({
                completed: false,
                assignedTo: myActiveEvaluationInProject.participants.find(p => p.user !== user),
                title: 'Not my action' + faker.lorem.words(),
                description: 'Not my action' + faker.lorem.words(),
            })
        )
        .addAction(
            myActiveEvaluationInProject.createAction({
                isVoided: true,
                completed: false,
                assignedTo: myActiveEvaluationInProject.participants.find(p => p.user === user),
                title: 'My voided action' + faker.lorem.words(),
                description: 'My voided action' + faker.lorem.words(),
            })
        )
        .addAction(
            myActiveEvaluationInProject.createAction({
                isVoided: false,
                completed: true,
                assignedTo: myActiveEvaluationInProject.participants.find(p => p.user === user),
                title: 'My completed action' + faker.lorem.words(),
                description: 'My completed action' + faker.lorem.words(),
            })
        )

    const notMyActiveEvaluationInProject = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users: users.slice(0, 2),
        roles: roles.slice(0, 2),
        fusionProjectId: selectedProject.id,
        namePrefix: 'notMyEval',
    })
    const myActiveEvaluationNotInProject = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression)),
        users: users,
        roles: roles,
        fusionProjectId: otherProject.id,
        namePrefix: 'notProjectEval',
    })
    const myHiddenEvaluationInProject = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression).filter(p => p !== Progression.Nomination)),
        users: users,
        roles: roles,
        fusionProjectId: selectedProject.id,
        namePrefix: 'hiddenEvalInProject',
        status: Status.Voided,
    })
    const notMyHiddenEvaluationNotInProject = new EvaluationSeed({
        progression: faker.random.arrayElement(Object.values(Progression).filter(p => p !== Progression.Nomination)),
        users: users.slice(0, 2),
        roles: roles.slice(0, 2),
        fusionProjectId: otherProject.id,
        namePrefix: 'hiddenEvalNotInProject',
        status: Status.Voided,
    })

    before(() => {
        myActiveEvaluationInProject.plant()
        notMyActiveEvaluationInProject.plant()
        myActiveEvaluationNotInProject.plant()
        myHiddenEvaluationInProject.plant()
        notMyHiddenEvaluationNotInProject.plant()
    })

    context(`Dashboard `, () => {
        context('My evaluations (only my evaluations are listed) regardless of status and project', () => {
            before(() => {
                cy.visitProject(user, fusionProject1.id)
            })
            const testdata = [
                { evaluation: myActiveEvaluationInProject, listed: true },
                { evaluation: notMyActiveEvaluationInProject, listed: false },
                { evaluation: myActiveEvaluationNotInProject, listed: true },
                { evaluation: myHiddenEvaluationInProject, listed: true },
                { evaluation: notMyHiddenEvaluationNotInProject, listed: false },
            ]
            testdata.forEach(t => {
                it(`Evaluation with state ${t.evaluation.status} in ${
                    t.evaluation.fusionProjectId === selectedProject.id ? 'selected' : ' different'
                } project (id=${t.evaluation.fusionProjectId}) that user ${
                    t.evaluation.participants.find(e => e.user === user)
                        ? 'participates in is listed'
                        : 'does not participate in is not listed '
                }`, () => {
                    const evalName = t.evaluation.name
                    cy.get(`[data-testid=project-table]`).within(() => {
                        t.listed ? cy.contains(evalName).should('exist') : cy.contains(evalName).should('not.exist')
                    })
                })
            })

            it('User can open own evaluation of selected project', () => {
                cy.visitProject(user, fusionProject1.id)
                const myEvalName = myActiveEvaluationInProject.name
                cy.contains(myEvalName).click()
                const evaluationPage = new EvaluationPage()
                evaluationPage.progressionStepLink(myActiveEvaluationInProject.progression).should('be.visible')
            })
        })

        context('Project evaluations (only active evaluation of selected project are listed)', () => {
            before('', () => {
                cy.visitProject(user, fusionProject1.id)
                cy.contains('Project evaluations').click()
            })
            const testdata = [
                { evaluation: myActiveEvaluationInProject, listed: true },
                { evaluation: notMyActiveEvaluationInProject, listed: true },
                { evaluation: myActiveEvaluationNotInProject, listed: false },
                { evaluation: myHiddenEvaluationInProject, listed: false },
                { evaluation: notMyHiddenEvaluationNotInProject, listed: false },
            ]
            testdata.forEach(t => {
                it(`Evaluation with state ${t.evaluation.status} in ${
                    t.evaluation.fusionProjectId === selectedProject.id ? 'selected' : ' different'
                } project (id=${t.evaluation.fusionProjectId}) with status ${t.evaluation.status} ${
                    t.evaluation.status === Status.Voided ? 'is not listed ' : 'is listed '
                }`, () => {
                    const evalName = t.evaluation.name
                    cy.get(`[data-testid=project-table]`).within(() => {
                        t.listed ? cy.contains(evalName).should('exist') : cy.contains(evalName).should('not.exist')
                    })
                })
            })

            it('User can open evaluation user is not part of', () => {
                cy.visitProject(user, fusionProject1.id)
                cy.contains('Project evaluations').click()
                const notMyEvalName = notMyActiveEvaluationInProject.name
                cy.contains(notMyEvalName).click()
                const evaluationPage = new EvaluationPage()
                evaluationPage.progressionStepLink(notMyActiveEvaluationInProject.progression).should('be.visible')
            })
        })
        context(`For Admin only: Listing of hidden evaluations`, () => {
            it('User with no admin role cannot see hidden evaluations', () => {
                cy.get('[role="button"').contains('Hidden evaluations').should('not.exist')
            })
            context('This context', () => {
                before('before ', () => {
                    cy.visitProject(adminUser, fusionProject1.id)
                })
                const testdata = [
                    { evaluation: myActiveEvaluationInProject, listed: false },
                    { evaluation: notMyActiveEvaluationInProject, listed: false },
                    { evaluation: myActiveEvaluationNotInProject, listed: false },
                    { evaluation: myHiddenEvaluationInProject, listed: true },
                    { evaluation: notMyHiddenEvaluationNotInProject, listed: true },
                ]
                testdata.forEach(t => {
                    it(`Evaluation with state ${t.evaluation.status} in ${
                        t.evaluation.fusionProjectId === selectedProject.id ? 'selected' : ' different'
                    } project (id=${t.evaluation.fusionProjectId}) ${
                        t.evaluation.status === Status.Voided ? 'is listed' : 'is not listed '
                    }`, () => {
                        cy.get('[role="button"').contains('Hidden evaluations').click()
                        t.listed ? cy.contains(t.evaluation.name).should('exist') : cy.contains(t.evaluation.name).should('not.exist')
                    })
                })
            })
        })
    })

    context('Actions', () => {
        before('', () => {
            cy.visitProject(user, fusionProject1.id)
            cy.get('button').contains('Actions').click()
        })

        context('Action table', () => {
            const actionTable = new ActionTable()
            it(`Action assigned to user is listed
            voided/cancelled actions assigned to user are not listed`, () => {
                actionTable.table().within(() => {
                    cy.contains(myActiveEvaluationInProject.actions.find(a => a.assignedTo.user === user)!.title).should('exist')
                })
                actionTable.table().within(() => {
                    cy.contains(
                        myActiveEvaluationInProject.actions.find(a => a.assignedTo.user === user && a.isVoided === true)!.title
                    ).should('not.exist')
                })
            })
            it('Action not assigned to user is not listed', () => {
                actionTable.table().within(() => {
                    cy.contains(myActiveEvaluationInProject.actions.find(a => a.assignedTo.user !== user)!.title).should('not.exist')
                })
            })
            it('Verify user can edit his own actions', () => {
                cy.visitProject(user, fusionProject1.id)
                cy.get('button').contains('Actions').click()
                const editActionDialog = new EditActionDialog()
                actionTable.table().should('be.visible')
                actionTable.action(myActiveEvaluationInProject.actions[0].title).click({ force: true })
                editActionDialog.body().should('be.visible')
            })
        })
    })

    context('Page navigation', () => {
        beforeEach('', () => {
            cy.visitProject(user, fusionProject1.id)
        })
        it('User can navigate to Actions tab from Dashboard', () => {
            cy.get('button').contains('Actions').click()
            cy.get(`[data-testid=action-table]`).should('be.visible')
        })
        it('User can navigate to Project evaluations from My evaluations', () => {
            cy.contains('Project evaluations').click()
            cy.get(`[data-testid=project-table]`).should('exist')
            const notMyEvalName = notMyActiveEvaluationInProject.name
            cy.contains(notMyEvalName).should('exist')
        })
    })
})
