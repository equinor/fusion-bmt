/* Fusion Calendar fields use British locale
 * https://github.com/equinor/fusion-api/blob/2f2af7f061f6a80a5f04663afa3c199420a32b46/src/intl/DateTime.ts
 * We must do the same as this format is not under our control
 */
export const FUSION_DATE_LOCALE = 'en-GB'

interface IEvaluationName {
    prefix: string
}

export const evaluationName = ({ prefix = 'Evaluation' }: IEvaluationName) => {
    return `${prefix}-(${Math.floor(Math.random() * 1000000)})`
}
