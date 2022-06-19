import { usePartnerFinder} from "../../hooks/queryHooks";
import { ChoiceEditor } from "../common/forms/ChoiceEditor";


interface Props {
    value?: string
    onChange: (value:string) => void
}

const defaultQuery = {
    nameContains: "",
    offset: 0,
    limit: 50,
    sortBy: "docType",
    sortByDescending: false
}

const PartnerSelector:React.FC<Props> = ({ value, onChange }) => {

    const [queryState, newQuery] = usePartnerFinder(defaultQuery);
    return (
        <ChoiceEditor
            placeholder="Select Partner"
            value={value}
            onChange={onChange}
            options={queryState.response && queryState.response?.data !== null ? queryState.response?.data : []}
            optionValue={i => i.id}
            optionTitle={i => i.name} />
    );
}

export default PartnerSelector;
