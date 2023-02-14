import {MatchExpression} from "src/types/subscriptions";
import React from "react";
import ExpressionBranch from "src/components/Subscriptions/MatchExpressionEditor/ExpressionBranchView";






type Props = {
    expression: MatchExpression
    expressionString: string

}

const MatchExpressionEditor: React.FC<Props> = ({expressionString, expression}) => {


    return <div className={"p-1 shadow rounded"}>
        <div>
            {expressionString}
        </div>
        <div>
            <ExpressionBranch expression={expression}/>
        </div>
    </div>
}
export default MatchExpressionEditor