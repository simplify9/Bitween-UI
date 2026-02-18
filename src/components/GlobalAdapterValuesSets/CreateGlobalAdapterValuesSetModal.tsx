import Modal from "src/components/common/Modal";
import React, {useEffect, useState} from "react";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import {useCreateGlobalAdapterValuesSetMutation} from "src/client/apis/globalAdapterValuesSetsApi";
import {useNavigate} from "react-router-dom";
import KeyValueEditor from "src/components/common/forms/KeyValueEditor";
import {KeyValuePair} from "src/types/common";

type Props = {
    onClose: () => void
}
const CreateGlobalAdapterValuesSetModal: React.FC<Props> = ({onClose}) => {
    const [createGlobalAdapterValuesSet, response] = useCreateGlobalAdapterValuesSetMutation()
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [values, setValues] = useState<KeyValuePair[]>([]);
    const nav = useNavigate()
    
    const onCreate = () => {
        if (id && id.length > 0 && name && name.length > 0) {
            const valuesObj: { [key: string]: string } = {};
            values.forEach(kv => {
                valuesObj[kv.key] = kv.value;
            });
            createGlobalAdapterValuesSet({id, name, values: valuesObj})
        }
    }

    useEffect(() => {
        if (response.isSuccess && response.data?.id) {
            onClose();
        }
    }, [response.isSuccess]);

    const onAdd = (kv: KeyValuePair) => {
        setValues(prev => [...prev, kv]);
    }

    const onRemove = (kv: KeyValuePair) => {
        setValues(prev => prev.filter(item => item !== kv));
    }

    const onEdit = (kv: KeyValuePair) => {
        // KeyValueEditor handles edit by removing old and adding new
        setValues(prev => prev.map(item => 
            item.key === kv.key ? kv : item
        ));
    }

    return <Modal onClose={onClose} submitLabel={"Create"} onSubmit={onCreate}>
        <FormField title="ID" className="grow">
            <TextEditor value={id} onChange={(t) => setId(t)}/>
        </FormField>
        <FormField title="Name" className="grow">
            <TextEditor value={name} onChange={(t) => setName(t)}/>
        </FormField>
        <KeyValueEditor 
            values={values} 
            title={'Values'}
            keyLabel={"Key"} 
            valueLabel={"Value"}
            onAdd={onAdd} 
            onRemove={onRemove}
            addLabel={"Add Value"}
            onEdit={onEdit}
        />
    </Modal>
}

export default CreateGlobalAdapterValuesSetModal;
