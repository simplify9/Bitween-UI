import { useAdapterFinder} from "../../hooks/queryHooks";
import { ChoiceEditor } from "../common/forms/ChoiceEditor";


interface Props {
    value?: string
    onChange: (value:string) => void
    type: 'mappers' | 'receivers' | 'handlers' | 'notifiers' | 'validators'
}


const AdapterSelector:React.FC<Props> = ({ value, onChange,type }) => {

    const [queryState, newQuery] = useAdapterFinder({prefix:type});

    return (
        <ChoiceEditor
            placeholder="Select Adapter"
            value={value}
            onChange={onChange}
            options={queryState.response && queryState.response !== null ? queryState.response : []}
            optionValue={i => i.id}
            optionTitle={i => i.title} />
    );
}

export default AdapterSelector;
