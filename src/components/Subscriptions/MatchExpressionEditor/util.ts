import {MatchExpression} from "src/types/subscriptions";


export const matchExpressionNormalizer = (match: MatchExpression, arr: Array<any>, parentId: string | null = null): Array<any> => {


    if (match.type === "not_one_of" || match.type === "one_of") {
        const id = crypto.randomUUID()

        arr.push({
            type: match.type,
            parentId: parentId,
            id: id,
            values: match.values,
            path: match.path
        })
        return arr

    }
    if (match.type === "or" || match.type === "and") {

        const id = crypto.randomUUID()

        arr.push({
            type: match.type,
            parentId: parentId,
            id: id
        })
        return matchExpressionNormalizer(match.left, arr, id).concat(matchExpressionNormalizer(match.right, arr, id))
    }
}
export const writeTerm = (expression: MatchExpression, operator: 'and' | 'or') => {

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
        return `${expression.path} IN (${expression.values.join(', ')})`;
    } else {
        return `${expression.path} NOT IN (${expression.values.join(', ')})`;
    }
}
