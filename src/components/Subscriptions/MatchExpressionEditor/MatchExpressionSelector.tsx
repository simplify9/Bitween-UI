import React from "react";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import {OptionType} from "src/types/common";
import {MatchExpression} from "src/types/subscriptions";

type Props = {
    onChange: (match: MatchExpression) => void
    value: MatchExpression

    promotedProperties: OptionType[]

}
const MatchExpressionSelector: React.FC<Props> = ({onChange, value}) => {
    const onSelect = (key: string) => {
        console.log(key)
        if (key === "or" || key === "and") {
            onChange({
                ...value,
                type: key,
                right: null,
                left: null
            })
        }
        if (key === "one_of" || key === "not_one_of") {
            onChange({
                ...value,
                type: key,
                path: "",
                values: []
            })
        }
    }

    return <div className={"max-w-[650px] ml-8 border border-primary-200 shadow rounded px-2 py-1"}>

        <ChoiceEditor
            value={""}
            placeholder={"Operator"}
            onChange={onSelect}
            optionTitle={(item: OptionType) => item.title}
            optionValue={(item: OptionType) => item.id}
            options={[
                {
                    id: "or",
                    title: "or"
                },
                {
                    id: "and",
                    title: "and"
                },
                {
                    id: "one_of",
                    title: "one_of"
                },
                {
                    id: "not_one_of",
                    title: "not_one_of"
                }
            ]}/>
    </div>
}
export default MatchExpressionSelector