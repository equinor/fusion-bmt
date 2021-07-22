

interface IEvaluationName {
    prefix: string
}

export const evaluationName = ({prefix='Evaluation'}: IEvaluationName) => {
    return `${prefix}-(${Math.floor(Math.random() * 1000000)})`
}
