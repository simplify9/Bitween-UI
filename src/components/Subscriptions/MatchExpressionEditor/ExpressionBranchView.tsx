import {MatchExpression} from "src/types/subscriptions";
import React from "react";


const writeTerm = (expression: MatchExpression, operator: 'and' | 'or') => {

    return expression.type === operator
        ? `(${Description(expression)})`
        : `${Description(expression)}`
}

const Description = (expression: MatchExpression) => {
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


type Props = {
    value: MatchExpression
    onChange: (value: MatchExpression) => void
}

const ExpressionBranch: React.FC<Props> = ({value}) => {

    // return <>{Description(value)}</>
    if (value.type === "or" || value.type === "and") {
        return <div className={"border shadow p-1 flex flex-row justify-between"}>
            <div className={" border shadow p-1  border border-blue-400 w-5/12"}>
                <ExpressionBranch onChange={() => {
                }} value={value.left}/>
            </div>
            <div className={""}>
                {value.type}
            </div>
            <div className={" border shadow p-1  border border-red-400 w-5/12"}>
                <ExpressionBranch onChange={() => {
                }} value={value.right}/>

            </div>
        </div>
    }
    if (value.type === "not_one_of" || value.type === "one_of") {
        return <div className={"border shadow p-1 flex flex-row justify-between"}>
            <div>
                Path: {value.path}

            </div>
            <div>
                Values: {value.values.map(i => i)}
            </div>
        </div>
    }
}
export default ExpressionBranch