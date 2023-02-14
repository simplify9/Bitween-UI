import {MatchExpression, MatchExpressionValue} from "src/types/subscriptions";
import React from "react";


const AndDescription = (expression: MatchExpression) => {

}
const Description = (expression: MatchExpression) => {
    
}





type Props = {
    expression: MatchExpression | MatchExpressionValue | undefined

}
const ExpressionBranch: React.FC<Props> = ({expression}) => {
    
    

    if (expression.type === "or" || expression.type === "and") {
        return <div className={"border shadow p-1 flex flex-row justify-between"}>
            <div className={" border shadow p-1  border border-blue-400 w-5/12"}>
                <ExpressionBranch expression={expression.left}/>
            </div>
            <div className={""}>
                {expression.type}
            </div>
            <div className={" border shadow p-1  border border-red-400 w-5/12"}>
                <ExpressionBranch expression={expression.right}/>

            </div>
        </div>
    }
    if (expression.type === "not_one_of" || expression.type === "one_of") {
        return <div className={"border shadow p-1 felx flex-row"}>
            <p>
                Path: {expression.path}

            </p>
            <div>
                Values: {expression.values.map(i => i)}
            </div>
        </div>
    }
}
export default ExpressionBranch