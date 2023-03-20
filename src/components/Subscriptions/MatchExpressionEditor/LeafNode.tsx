import {RxCross1} from "react-icons/rx";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import TextEditor from "src/components/common/forms/TextEditor";
import React from "react";
import {OptionType} from "src/types/common";
import {NotOneOfMatchExpression, OneOfMatchExpression} from "src/types/subscriptions";

type Props = {
    onDeleteNode: () => void
    promotedProperties: OptionType[]
    value: | OneOfMatchExpression
        | NotOneOfMatchExpression
    onChange: (v: | OneOfMatchExpression
        | NotOneOfMatchExpression) => void
}
const LeafNode: React.FC<Props> = ({onDeleteNode, promotedProperties, onChange, value}) => {

    return <div className={"p-1 px-2 ml-8 border border-primary-200 shadow rounded-lg max-w-[650px]"}>
        <div className={"  flex flex-row  items-end justify-between"}>
            <div className={""}>
                <ChoiceEditor
                    placeholder={"Property"}
                    options={promotedProperties}
                    optionValue={(item) => item.id}
                    optionTitle={(item) => item.title}
                    value={value.path}
                    onChange={(t) => onChange({...value, path: t})}/>
            </div>
            <div className={"flex flex-col items-center"}>
                <div className={"flex "}>
                    <RxCross1 onClick={onDeleteNode} className={"text-red-500"}/>
                </div>
                <div
                    onClick={() => {
                        onChange({...value, type: value.type == "one_of" ? 'not_one_of' : "one_of"})
                    }}
                    className={"shadow rounded text-center p-1 w-[120px] bg-primary-200 cursor-pointer "}
                >
                    {value.type === "one_of" ? "IN" : "NOT IN"}
                </div>
            </div>
            <div className={""}>

                <TextEditor placeholder={"values"} onChange={(e) => {
                    onChange({...value, values: e.split(",")})
                }} value={value.values.join(",")}/>

            </div>
        </div>
    </div>
}
export default React.memo(LeafNode)