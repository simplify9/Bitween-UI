import {MatchExpression} from "src/types/subscriptions";


export const writeTerm = (expression: MatchExpression, operator: 'and' | 'or') => {

    if (!expression)
        return ""
    return expression.type === operator
        ? `(${getDescription(expression)})`
        : `${getDescription(expression)}`
}

export const getDescription = (expression: MatchExpression) => {
    if (!expression)
        return ""

    if (expression.type === 'and') {

        return `${writeTerm(expression.left, 'or')} AND ${writeTerm(expression.right, 'or')}`

    } else if (expression.type === 'or') {
        return `${writeTerm(expression.left, 'and')} OR ${writeTerm(expression.right, 'and')}`
    } else if (expression.type === 'one_of') {
        return `"${expression.path}" IN ('${expression.values.join("', '")}')`;
    } else {
        return `"${expression.path}" NOT IN ('${expression.values.join("', '")}')`;
    }
}
