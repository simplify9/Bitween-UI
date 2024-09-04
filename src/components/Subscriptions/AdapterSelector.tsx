import {ChoiceEditor} from "../common/forms/ChoiceEditor";
import {useAdaptersLookupQuery} from "src/client/apis/generalApi";
import {useMemo} from "react";


interface Props {
    value?: string
    onChange: (value: string) => void
    type: 'mappers' | 'receivers' | 'handlers' | 'notifiers' | 'validators'
}


const AdapterSelector: React.FC<Props> = ({value, onChange, type}) => {

    const queryState = useAdaptersLookupQuery({prefix: type});

    console.log(queryState.data)
    const options = useMemo(() => {
        if (!queryState.data)
            return []
        return Object.keys(queryState.data).map((k) => {
            return {
                key: k,
                title: k
            }
        })
    }, [queryState.data])
    return (
        <ChoiceEditor
            placeholder="Select Adapter"
            value={value}
            onChange={onChange}
            options={options}
            optionValue={i => i.key}
            optionTitle={i => i.title}/>
    );
}

export default AdapterSelector;
