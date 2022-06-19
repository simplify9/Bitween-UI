import { useSubscriptionFinder } from "../../hooks/queryHooks";
import { ChoiceEditor } from "../common/forms/ChoiceEditor";


interface Props {
    value: string
    onChange: (value:string) => void
}

const SubscriptionSelector:React.FC<Props> = ({ value, onChange }) => {
    return (
        <></>
        // <ChoiceEditor
        //     placeholder="Select Subscription"
        //     value={value}
        //     onChange={onChange}
        //     options={queryState.results !== null ? queryState.results.data : []}
        //     optionValue={i => i.id}
        //     optionTitle={i => i.desc} />
    );
}

export default SubscriptionSelector;
