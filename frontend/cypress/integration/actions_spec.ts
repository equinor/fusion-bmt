import { EvaluationSeed } from '../support/evaluation_seed'
import { Priority, Progression } from '../../src/api/models'
import { Action } from '../support/mocks'
import ActionsGrid from '../support/action_grid'
import { ConfirmationDialog } from '../support/common'
import { DELETE_ACTION } from '../support/gql'

describe('Actions', () => {
    context('Delete', () => {
        let seed: EvaluationSeed
        let actionToDelete: Action
        let actionToStay: Action

        beforeEach(() => {
            ;({ seed, actionToDelete, actionToStay } = createDeleteSeed())

            seed.plant().then(() => {
                cy.visitEvaluation(seed.evaluationId, seed.participants[0].user)
                cy.contains(actionToDelete.title).should('exist')
                cy.contains(actionToStay.title).should('exist')
            })
        })

        const deleteAction = () => {
            const actionsGrid = new ActionsGrid()
            actionsGrid.deleteActionButton(actionToDelete.id).click()

            const confirmationDialog = new ConfirmationDialog()
            confirmationDialog.yesButton().click()
        }

        it('User can delete an action', () => {
            deleteAction()
            cy.testCacheAndDB(() => {
                cy.contains(actionToDelete.title).should('not.exist')
                cy.contains(actionToStay.title).should('exist')
            })
        })

        it('User can cancel action delete', () => {
            new ActionsGrid().deleteActionButton(actionToDelete.id).click()
            new ConfirmationDialog().noButton().click()

            cy.testCacheAndDB(() => {
                cy.contains(actionToDelete.title).should('exist')
                cy.contains(actionToStay.title).should('exist')
            })
        })

        it('User can not delete deleted action', () => {
            cy.gql(DELETE_ACTION, {
                variables: {
                    actionId: actionToDelete.id,
                },
            }).then(() => {
                cy.on('uncaught:exception', (err, runnable) => {
                    expect(err.message).to.include('Action not found')
                    return false
                })

                deleteAction()

                cy.testCacheAndDB(
                    () => {
                        cy.contains(actionToDelete.title).should('not.exist')
                        cy.contains(actionToStay.title).should('exist')
                        cy.contains('Action not found').should('exist')
                    },
                    () => {
                        cy.contains(actionToDelete.title).should('not.exist')
                        cy.contains(actionToStay.title).should('exist')
                        cy.contains('Action not found').should('not.exist')
                    }
                )
            })
        })
    })
})

const createDeleteSeed = () => {
    let seed = new EvaluationSeed({ progression: Progression.Workshop, nParticipants: 2 })

    let facilitator = seed.participants[0]
    let engineer = seed.participants[1]

    const actionToDelete = new Action({
        questionOrder: 1,
        assignedTo: engineer,
        createdBy: facilitator,
        dueDate: new Date(),
        title: 'You shall be murdered! 😇',
        priority: Priority.High,
        description: 'Naughty, naughty action!',
    })

    const actionToStay = new Action({
        questionOrder: 1,
        assignedTo: engineer,
        createdBy: facilitator,
        dueDate: new Date(),
        title: 'You have my permission to live 😈',
        priority: Priority.Low,
    })

    seed.addAction(actionToDelete).addAction(actionToStay)
    return { seed, actionToDelete, actionToStay }
}
