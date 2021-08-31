export default class StepperGrid {
    nomination = () => {
        return cy.get('a').contains('Nomination')
    }

    individualAssessment = () => {
        return cy.get('a').contains('Individual Assessment')
    }

    preparation = () => {
        return cy.get('a').contains('Preparation')
    }

    workshopAssessment = () => {
        return cy.get('a').contains('Workshop Assessment')
    }

    followUp = () => {
        return cy.get('div').contains('Follow-up')
    }
}
