import {ChoiceEditor} from "../common/forms/ChoiceEditor";
import React, {useMemo} from "react";
import {useSubscriptionsQuery} from "src/client/apis/subscriptionsApi";


interface Props {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
    multiple?: boolean
}

const defaultQuery = {
    nameContains: '',
    keywords: "",
    offset: 0,
    limit: 100,
    sortBy: "docType",
    sortByDescending: false
}

const SubscriptionSelector: React.FC<Props> = ({value, onChange, disabled, multiple}) => {

    const data = useSubscriptionsQuery({offset: 0, limit: 200})
    const options = useMemo(() => {

            if (!data.data)
                return []

            return data.data.result.map(i => ({id: i.id.toString(), name: i.name.toString()}))
        }
        , [data.data]);
    return (
        <ChoiceEditor
            placeholder="Select Subscription"
            disabled={disabled}
            multiple={multiple}
            value={value}
            onChange={onChange}
            options={options}
            optionValue={i => i.id}
            optionTitle={i => i.name}/>
    );
}

export default SubscriptionSelector;
