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

    before('Plant (load into DB) all evaluations', () => {
        myActiveEvaluationInProject.plant()
        notMyActiveEvaluationInProject.plant()
        myActiveEvaluationNotInProject.plant()
        myHiddenEvaluationInProject.plant()
        notMyHiddenEvaluationNotInProject.plant()
    })

    const evaluations = [
        { evaluation: myActiveEvaluationInProject, mine: true, inProject: true, hidden: false },
        { evaluation: notMyActiveEvaluationInProject, mine: false, inProject: true, hidden: false },
        { evaluation: myActiveEvaluationNotInProject, mine: true, inProject: false, hidden: false },
        { evaluation: myHiddenEvaluationInProject, mine: true, inProject: false, hidden: true },
        { evaluation: notMyHiddenEvaluationNotInProject, mine: false, inProject: false, hidden: true },
    ]

    context(`Dashboard `, () => {
        context('My evaluations (only my evaluations are listed) regardless of status and project', () => {
            before('Log in as user', () => {
                cy.visitProject(user, fusionProject1.id)
            })

            evaluations.forEach(t => {
                it(`Evaluation with state ${t.evaluation.status} in ${t.inProject ? 'selected' : ' different'} project (id=${
                    t.evaluation.fusionProjectId
                }) that user ${t.mine ? 'participates in is listed' : 'does not participate in is not listed '}`, () => {
                    const evalName = t.evaluation.name
                    cy.get(`[data-testid=project-table]`).within(() => {
                        t.mine ? cy.contains(evalName).should('exist') : cy.contains(evalName).should('not.exist')
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
            before('Log in as user, go to project evaluations', () => {
                cy.visitProject(user, fusionProject1.id)
                cy.contains('Project evaluations').click()
            })
            evaluations.forEach(t => {
                it(`Evaluation with state ${t.evaluation.status} in ${t.inProject ? 'selected' : ' different'} project (id=${
                    t.evaluation.fusionProjectId
                }) with status ${t.evaluation.status} ${t.inProject ? 'is listed ' : 'is not listed '}`, () => {
                    const evalName = t.evaluation.name
                    cy.get(`[data-testid=project-table]`).within(() => {
                        t.inProject ? cy.contains(evalName).should('exist') : cy.contains(evalName).should('not.exist')
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
                cy.visitProject(user, fusionProject1.id)
                cy.contains('Project evaluations').should('exist')
                cy.get('[role="button"').contains('Hidden evaluations').should('not.exist')
            })
            context('This context', () => {
                before('Log in as admin ', () => {
                    cy.visitProject(adminUser, fusionProject1.id)
                })
                evaluations.forEach(t => {
                    it(`Evaluation with state ${t.evaluation.status} in ${t.inProject ? 'selected' : ' different'} project (id=${
                        t.evaluation.fusionProjectId
                    }) ${t.hidden ? 'is listed' : 'is not listed '}`, () => {
                        cy.get('[role="button"').contains('Hidden evaluations').click()
                        t.hidden ? cy.contains(t.evaluation.name).should('exist') : cy.contains(t.evaluation.name).should('not.exist')
                    })
                })
            })
        })
    })

    context('Actions', () => {
        before('Log in as user, go to actions table', () => {
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
        beforeEach('Log in as user', () => {
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
