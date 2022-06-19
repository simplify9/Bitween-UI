import { useDocumentFinder } from "../../hooks/queryHooks";
import { ChoiceEditor } from "../common/forms/ChoiceEditor";


interface Props {
    value?: string
    onChange: (value:string) => void
}

const defaultQuery = {
    mode: "keyword",
    creationDateFrom: undefined,
    creationDateTo: undefined,
    keywords: "",
    offset: 0,
    limit: 50,
    sortBy: "docType",
    sortByDescending: false
}

const DocumentSelector:React.FC<Props> = ({ value, onChange }) => {

    const [queryState, newQuery] = useDocumentFinder(defaultQuery);
    return (
        <ChoiceEditor
            placeholder="Select Document"
            value={value}
            onChange={onChange}
            options={queryState.response && queryState.response?.data !== null ? queryState.response?.data : []}
            optionValue={i => i.id}
            optionTitle={i => i.name} />
    );
}

export default DocumentSelector;
