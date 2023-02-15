import {MatchExpression} from "src/types/subscriptions";
import React, {useCallback, useEffect, useState} from "react";
import {KeyValuePair} from "src/types/common";
import {apiClient} from "src/client";
import FormEditor from "src/components/Subscriptions/MatchExpressionEditor/FromEditor";
import ExpressionBranch from "src/components/Subscriptions/MatchExpressionEditor/ExpressionBranchView";


type Props = {
    expression: MatchExpression
    expressionString: string
    documentId: string

}

const MatchExpressionEditor: React.FC<Props> = ({expressionString, expression, documentId}) => {

    const [state, setState] = useState(expression);

    const onChangeExpression = useCallback(() => {
        //  setState
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
                    name: i.key,
                    label: i.value
                })))
            setPromotedProperties(k)
        }


    }
    useEffect(() => {
        loadData()

    }, [documentId])
    console.log(promotedProperties)
    return <div className={"p-1 shadow rounded"}>
        {
            promotedProperties && <FormEditor fields={promotedProperties}/>

        }
        <div>
           %%%%%%%% {expressionString} %%%%%%%%
        </div>
        <div>
            <ExpressionBranch onChange={onChangeExpression} value={state}/>
        </div>
    </div>
}
export default MatchExpressionEditor