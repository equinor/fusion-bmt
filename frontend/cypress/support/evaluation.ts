import { Progression } from '../../src/api/models'
import { progressionToString } from '../../src/utils/EnumToString'

export class EvaluationPage {
    progressionStepLink = (progression: Progression) => {
        /**
         * We can't identify stepper itself, without stepper content.
         * We also have no ids to tie up to. Thus at the moment search
         * the whole document for links with expected progression text.
         * Seems to hold as of now.
         */
        return cy.contains('a', progressionToString(progression))
    }
}
