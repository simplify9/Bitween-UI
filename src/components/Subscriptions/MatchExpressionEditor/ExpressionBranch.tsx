import {MatchExpression} from "src/types/subscriptions";
import React, {useCallback, useState} from "react";
import MatchExpressionSelector from "src/components/Subscriptions/MatchExpressionEditor/MatchExpressionSelector";
import {OptionType} from "src/types/common";

import LeafNode from "src/components/Subscriptions/MatchExpressionEditor/LeafNode";
import {getDescription} from "src/components/Subscriptions/MatchExpressionEditor/util";
import SyntaxHighlighter from "react-syntax-highlighter";
import {xcode} from "react-syntax-highlighter/dist/esm/styles/hljs";
import OperatorNode from "src/components/Subscriptions/MatchExpressionEditor/OperatorNode";
import {AiOutlineArrowDown, AiOutlineArrowUp} from "react-icons/ai"

type Props = {
    value: MatchExpression
    onChange: (value: MatchExpression) => void
    promotedProperties: OptionType[]
}

const ExpressionBranch: React.FC<Props> = ({value, promotedProperties, onChange}) => {

    const [collapsed, setCollapsed] = useState(false);
    const onDeleteNode = useCallback(() => onChange(null), [])

    if (!Boolean(value))
        return <div>
            <MatchExpressionSelector promotedProperties={promotedProperties} value={value} onChange={onChange}/>
        </div>
    const Arrow = collapsed ? AiOutlineArrowDown : AiOutlineArrowUp
    if (collapsed) {
        return <div className={"border  border-blue-200 rounded shadow p-1 flex   ml-10 pr-5"}>
            <div className={"  my-1 flex flex-row items-center "}>
                <div
                    onClick={() => {
                        // @ts-ignore
                        onChange(({...value, type: value.type == "or" ? 'and' : "or"}))
                    }}
                    className={"shadow rounded text-center p-1 w-[120px] underline bg-blue-100  cursor-pointer"}
                >
                    {value.type.toUpperCase()}
                </div>
                <div className={"text-blue-800 mx-3 bg-blue-200 px-3 rounded py-1"}>
                    <Arrow size={21} onClick={() => setCollapsed(c => !c)}/>
                </div>
                <div>
                    <SyntaxHighlighter wrapLines={true} language="sql" style={xcode}>
                        {getDescription(value)}
                    </SyntaxHighlighter>

                </div>
            </div>
        </div>
    }


    if (value.type === "or" || value.type === "and") {
        return <OperatorNode collapsed={collapsed} onDeleteNode={onDeleteNode} onChange={onChange}
                             promotedProperties={promotedProperties}
                             value={value} setCollapsed={setCollapsed}/>
    }
    if (value.type === "not_one_of" || value.type === "one_of") {
        return <LeafNode onDeleteNode={onDeleteNode} onChange={onChange} promotedProperties={promotedProperties}
                         value={value}/>
    }
}
export default React.memo(ExpressionBranch)