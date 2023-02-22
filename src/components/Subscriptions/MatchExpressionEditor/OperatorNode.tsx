import {RxCross1} from "react-icons/rx";
import React from "react";
import {OptionType} from "src/types/common";
import {AndMatchExpression, OrMatchExpression} from "src/types/subscriptions";
import ExpressionBranch from "src/components/Subscriptions/MatchExpressionEditor/ExpressionBranch";
import {AiOutlineArrowDown, AiOutlineArrowUp} from "react-icons/ai";

type Props = {
    collapsed: boolean
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
    onDeleteNode: () => void
    promotedProperties: OptionType[]
    value: AndMatchExpression
        | OrMatchExpression
    onChange: (v: AndMatchExpression
        | OrMatchExpression) => void
}
const OperatorNode: React.FC<Props> = ({
                                           onDeleteNode,
                                           promotedProperties,
                                           onChange,
                                           value,
                                           setCollapsed,
                                           collapsed
                                       }) => {

    const Arrow = collapsed ? AiOutlineArrowDown : AiOutlineArrowUp

    return <div className={"ml-8 mr-8"}>

        <div className={"border border-blue-200 rounded shadow-md p-1 flex flex-col justify-between   "}>
            <div className={"  flex flex-row  justify-between items-center  w-full"}>
                <div className={"  flex flex-row items-center  "}>
                    <div
                        onClick={() => {
                            onChange(({...value, type: value.type == "or" ? 'and' : "or"}))
                        }}
                        className={"shadow rounded text-center p-1 w-[120px] underline bg-blue-100  cursor-pointer"}
                    >
                        {value.type.toUpperCase()}
                    </div>
                    <div className={"text-blue-800 mx-3 bg-blue-200 px-3 rounded py-1"}>
                        <Arrow size={21} onClick={() => setCollapsed(c => !c)}/>
                    </div>
                </div>

                <div className={"flex flex-row-reverse"}>
                    <RxCross1 onClick={onDeleteNode} className={"text-red-500"}/>
                </div>
            </div>
            <div className={" p-1 pb-0   "}>
                <ExpressionBranch promotedProperties={promotedProperties} onChange={(e) => {
                    onChange(({...value, left: e}))
                }} value={value.left}/>
            </div>

            <div className={"  p-1    "}>
                <ExpressionBranch promotedProperties={promotedProperties} onChange={(e) => {
                    onChange(({...value, right: e}))
                }} value={value.right}/>

            </div>
        </div>
    </div>
}
export default React.memo(OperatorNode)