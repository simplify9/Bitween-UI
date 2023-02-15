import {MatchExpression} from "src/types/subscriptions";
import React, {useCallback, useEffect, useState} from "react";
import {KeyValuePair, OptionType} from "src/types/common";
import {apiClient} from "src/client";
import ExpressionBranch from "src/components/Subscriptions/MatchExpressionEditor/ExpressionBranch";
import {getDescription} from "src/components/Subscriptions/MatchExpressionEditor/util";
import SyntaxHighlighter from "react-syntax-highlighter";
import {xcode} from "react-syntax-highlighter/dist/esm/styles/hljs";

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
    onChange: (expression: MatchExpression) => void
}

const MatchExpressionEditor: React.FC<Props> = ({expression, documentId, onChange}) => {

    const [promotedProperties, setPromotedProperties] = useState<Array<any>>([])
    const [documentName, setDocumentName] = useState<string>("DOCUMENT")

    const onChangeExpression = useCallback((e: MatchExpression) => {
        console.log("mama")
        onChange(e)
    }, [])


    const loadData = async () => {
        if (!documentId)
            return;
        const data = await apiClient.findDocument(documentId);
        if (data.succeeded) {
            setDocumentName(data.data.name)
            const k = ((data?.data?.promotedProperties as Array<KeyValuePair>)
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

    return <div className={"p-1 shadow-md rounded border"}>

        <div className={"text-center pt-2 pb-1"}>
            <SyntaxHighlighter wrapLines={true} language="sql" style={xcode}>
                {`SELECT * FROM "${documentName}" WHERE ${getDescription(expression) || "TRUE"} `}
            </SyntaxHighlighter>
        </div>

        <div className={"pr-8"}>
            <ExpressionBranch promotedProperties={promotedProperties} onChange={onChangeExpression} value={expression}/>
        </div>
    </div>
}
export default MatchExpressionEditor