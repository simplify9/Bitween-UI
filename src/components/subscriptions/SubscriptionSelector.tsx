import { useMemo } from "react";
import { useSubscriptionFinder } from "../../hooks/queryHooks";
import { ChoiceEditor } from "../common/forms/ChoiceEditor";


interface Props {
    value: string
    onChange: (value:string) => void
}

const SubscriptionSelector:React.FC<Props> = ({ value, onChange }) => {
    //const req = useMemo(() => ({ id: value, offset: 0, limit: 20, sortBy: "desc" }), [value]);
    const [queryState, find] = useSubscriptionFinder({ id: value, offset: 0, limit: 20, sortBy: "desc" });

    return (
        <ChoiceEditor 
            placeholder="Select Subscription"
            value={value} 
            onChange={onChange}
            options={queryState.data} 
            optionValue={i => i.id}
            optionTitle={i => i.desc} />
    );
}

export default SubscriptionSelector;