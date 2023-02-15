import {MatchExpression} from "src/types/subscriptions";
import React, {useCallback, useEffect, useState} from "react";
import {KeyValuePair, OptionType} from "src/types/common";
import {apiClient} from "src/client";
import ExpressionBranch from "src/components/Subscriptions/MatchExpressionEditor/ExpressionBranchView";
import {getDescription} from "src/components/Subscriptions/MatchExpressionEditor/util";

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
    expression: MatchExpression
    documentId: string

}

const MatchExpressionEditor: React.FC<Props> = ({expression, documentId}) => {

    const [state, setState] = useState(expression);

    const onChangeExpression = useCallback((e: MatchExpression) => {
        console.log("e")
        setState(e)
    }, [])
    const [promotedProperties, setPromotedProperties] = useState<Array<any>>([])


    const loadData = async () => {
        if (!documentId)
            return;
        const data = await apiClient.findDocument(documentId);
        if (data.succeeded) {
            const k = ((data?.data?.promotedProperties as Array<KeyValuePair>)
                //?.filter(i => documentFilter?.some(i => i.key != i.key))
                .map((i) => ({
                    id: i.key,
                    title: i.value
                }))) as OptionType[]
            setPromotedProperties(k)
        }
    }
    useEffect(() => {
        loadData()

    }, [documentId])

    // console.log(matchExpressionNormalizer(expression, [], null))
    return <div className={"p-1 shadow rounded"}>

        <div>
            {getDescription(expression)}
        </div>
        <div>
            <ExpressionBranch promotedProperties={promotedProperties} onChange={onChangeExpression} value={state}/>
        </div>
    </div>
}
export default MatchExpressionEditor