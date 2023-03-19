import FormField from "../common/forms/FormField";
import AdapterSelector from "./AdapterSelector";
import React, {useEffect, useState} from "react";
import {apiClient} from "../../client";
import {KeyValuePair, OptionType} from "../../types/common";
import KeyValueEditor from "../common/forms/KeyValueEditor";


interface Props {
    value?: string
    onChange: (value: string) => void
    type: 'mappers' | 'receivers' | 'handlers' | 'notifiers' | 'validators'
    props?: KeyValuePair[],
    onPropsChange?: (p: KeyValuePair[]) => void
    title: string;
}


const AdapterEditor: React.FC<Props> = ({
                                            value,
                                            onChange,
                                            type,
                                            title,
                                            props,
                                            onPropsChange
                                        }) => {


    const [adapterPropsOptions, setAdapterPropsOptions] = useState<OptionType[]>();

    useEffect(() => {
        if (value) {
            apiClient.findAdapterProperties(value)
                .then((r) => setAdapterPropsOptions(r));
        }

    }, [value])

    const availableOptions = () => {
        return adapterPropsOptions?.filter(o => props?.find(x => x.key == o.id) == undefined)
    }

    const onAdd = (v: KeyValuePair) => {
        let pparr = props ?? [];
        pparr?.push(v);
        onPropsChange!(pparr)

    }

    const onEdit = (v: KeyValuePair) => {
        let pparr = props.filter(i => i.key != v.key) ?? [];
        pparr?.push(v);
        onPropsChange!(pparr)

    }
    const onRemove = (v: KeyValuePair) => {
        let pparr: KeyValuePair[] = [];
        props?.forEach(pp => {
            if (pp.value != v.value && pp.key != v.key) pparr.push(pp);
        });
        onPropsChange!(pparr)
    }

    return (
        <div className={""}>
            <div className={"flex flex-col gap-2"}>
                <FormField title={title} className="grow ">
                    <AdapterSelector type={type} value={value} onChange={onChange}/>
                </FormField>
                <div className={"mb-1"}/>
                <KeyValueEditor values={props} title={'Properties'}
                                keyLabel={"Name"} valueLabel={"Value"}
                                onAdd={onAdd} onRemove={onRemove}
                                addLabel={"Add or edit"}
                                onEdit={onEdit}
                                keyOptions={availableOptions()}
                />

            </div>

        </div>
    );
}

export default AdapterEditor;
