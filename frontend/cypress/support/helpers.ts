

interface IEvaluationName {
    prefix: string
}

export const evaluationName = ({prefix='Evaluation'}: IEvaluationName) => {
    return `${prefix}-(${Date.now()}) `
}
