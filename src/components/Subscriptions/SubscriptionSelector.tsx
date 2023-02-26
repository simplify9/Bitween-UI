import {useSubscriptionFinder} from "../../hooks/queryHooks";
import {ChoiceEditor} from "../common/forms/ChoiceEditor";
import React from "react";


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
    limit: 20,
    sortBy: "docType",
    sortByDescending: false
}

const SubscriptionSelector: React.FC<Props> = ({value, onChange, disabled, multiple}) => {

    const [queryState, newQuery] = useSubscriptionFinder(defaultQuery);
    
    return (
        <ChoiceEditor
            placeholder="Select Subscription"
            disabled={disabled}
            multiple={multiple}
            value={value}
            onChange={onChange}
            options={queryState.response && queryState.response?.data !== null ? queryState.response?.data : []}
            optionValue={i => i.id}
            optionTitle={i => i.name}/>
    );
}

export default SubscriptionSelector;
