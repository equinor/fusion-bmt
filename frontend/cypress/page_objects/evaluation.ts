import { contains } from 'cypress/types/jquery'
import { Progression } from '../../src/api/models'
import { progressionToString } from '../../src/utils/EnumToString'
import { MarkdownEditor } from '../page_objects/common'

export class EvaluationPage {
    progressionStepLink = (progression: Progression, state: 'In Progress' | 'Complete' | 'Awaiting' | '' = '') => {
        /**
         * We can't identify stepper itself, without stepper content.
         * We also have no ids to tie up to. Thus at the moment search
         * the whole document for links with expected progression text.
         * Seems to hold as of now.
         */
        return cy.contains('a', new RegExp(`${progressionToString(progression)}.*${state}`))
    }

    barrierPanel = () => {
        return cy.getByDataTestid('sticky')
    }

    goToBarrier = (barrier: Barrier) => {
        cy.contains('span', barrier).click()
        cy.contains(barrier)
    }

    barrierQuestionCount = (barrier: Barrier) => {
        return cy.contains('span', barrier).next()
    }

    questionNoSelector = '[data-testid^=questionNo-]'

    completeSwitch = () => {
        return cy.getByDataTestid('complete-switch')
    }

    clickViewAnswers = (questionOrder: number) => {
        cy.getByDataTestid('view-answers-' + questionOrder).within(() => {
            cy.getByDataTestid('view-answers').click()
        })
    }

    verifyAnswerVisible = (stage: string, user: string, answer: string) => {
        cy.contains('h5', stage).nextUntil().contains(user).scrollIntoView()
        cy.contains('h5', stage).nextUntil().contains(user).should('be.visible')
        cy.contains('h5', stage).nextUntil().contains(user).next().contains(answer).should('be.visible')
    }

    writeAnswer = (questionNo: number, answer: string) => {
        const markdownEditor = new MarkdownEditor()
        cy.get(`[id=question-${questionNo}]`).within(fn => {
            markdownEditor.setContent(answer)
        })
    }

    assertCannotWriteAnswer = (questionNo: number) => {
        cy.get(`[id=question-${questionNo}]`).within(fn => {
            cy.getByDataTestid('disabler_box_div').should('have.css', 'display', 'block')
        })
    }

    assertAnswerText = (questionNo: number, answer: string) => {
        const markdownEditor = new MarkdownEditor()
        cy.get(`[id=question-${questionNo}]`).within(fn => {
            markdownEditor.assertContent(answer)
        })
    }
}

export enum Barrier {
    GeneralMatters = 'General Matters',
    Containment = 'Containment',
    HVAC = 'HVAC',
    LeakDetection = 'Leak Detection',
    ESD = 'ESD',
    IgnitionSourceControl = 'Ignition Source Control',
    FireDetection = 'Fire Detection',
    ProcessSafety = 'Process Safety',
    Layout = 'Layout',
    HMI = 'HMI',
}

export class QuestionnaireSidePanel {
    body = () => {
        return cy
            .get("div[role='tablist']")
            .children()
            .eq(0)
            .invoke('attr', 'aria-controls')
            .then(id => {
                return cy
                    .get('#' + id)
                    .children()
                    .eq(0)
                    .children()
                    .eq(0)
                    .children()
                    .eq(0)
            })
    }
}
