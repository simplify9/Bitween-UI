import React from "react";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import {OptionType} from "src/types/common";
import FormField from "src/components/common/forms/FormField";
import {MatchExpression} from "src/types/subscriptions";

type Props = {
    onChange: (match: MatchExpression) => void
    value: MatchExpression
}
const MatchExpressionBlock: React.FC<Props> = ({onChange, value}) => {


    const onSelect = (key: string) => {

        // if (value === "or" || key === "and") {
        //
        //
        // }
        // if (value === "one_of" || value === "not_one_of") {
        //
        //     onChange({
        //         ...value,
        //         type: value,
        //         path: "",
        //         values: ""
        //     })
        // }
    }
    return <div>

        <FormField title="Type" className="grow">
            <ChoiceEditor
                disabled={true}
                value={""}
                onChange={onSelect}
                optionTitle={(item: OptionType) => item.title}
                optionValue={(item: OptionType) => item.id}
                options={[
                    {
                        id: "or",
                        title: "orr"
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
        </FormField>
    </div>
}
export default MatchExpressionBlock