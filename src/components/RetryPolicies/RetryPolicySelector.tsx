import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import React, {useMemo} from "react";
import {useRetryPoliciesQuery} from "src/client/apis/retryPoliciesApi";


interface Props {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
}

const RetryPolicySelector: React.FC<Props> = ({value, onChange, disabled}) => {

    const data = useRetryPoliciesQuery({offset: 0, limit: 200})
    const options = useMemo(() => {
            if (!data.data)
                return []

            return data.data.result.map(i => ({id: i.id.toString(), name: i.name}))
        }
        , [data.data]);
    return (
        <ChoiceEditor
            placeholder="Select Retry Policy"
            disabled={disabled}
            value={value}
            onChange={onChange}
            options={options}
            optionValue={i => i.id}
            optionTitle={i => i.name}/>
    );
}

export default RetryPolicySelector;
