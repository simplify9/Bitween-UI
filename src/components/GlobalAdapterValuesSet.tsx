import {useNavigate, useParams} from "react-router-dom";
import {
    useLazyGlobalAdapterValuesSetQuery,
    useUpdateGlobalAdapterValuesSetMutation,
    useDeleteGlobalAdapterValuesSetMutation
} from "../client/apis/globalAdapterValuesSetsApi";
import Button from "src/components/common/forms/Button";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import Authorize from "src/components/common/authorize/authorize";
import React, {useEffect, useState} from "react";
import {GlobalAdapterValuesSetModel} from "src/types/globalAdapterValuesSets";
import KeyValueEditor from "src/components/common/forms/KeyValueEditor";
import {KeyValuePair} from "src/types/common";
import Dialog from "src/components/common/dialog";

const GlobalAdapterValuesSet = () => {

    const nav = useNavigate()
    const [data, setData] = useState<GlobalAdapterValuesSetModel>()
    const [values, setValues] = useState<KeyValuePair[]>([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const {id} = useParams() as { id: string }
    const [fetch] = useLazyGlobalAdapterValuesSetQuery()
    const [update] = useUpdateGlobalAdapterValuesSetMutation()
    const [deleteSet] = useDeleteGlobalAdapterValuesSetMutation()
    
    const fetchData = async () => {
        const result = await fetch(id)
        if (result.isSuccess && result.data) {
            setData(result.data)
            // Convert values object to KeyValuePair array
            const valuesArray: KeyValuePair[] = Object.entries(result.data.values || {}).map(([key, value]) => ({
                key,
                value
            }));
            setValues(valuesArray);
        }
    }

    const onUpdate = () => {
        if (!data) return;
        
        // Convert values array to object
        const valuesObj: { [key: string]: string } = {};
        values.forEach(kv => {
            valuesObj[kv.key] = kv.value;
        });
        
        update({
            id: data.id,
            name: data.name,
            values: valuesObj
        })
    }

    const onDelete = async () => {
        if (!data) return;
        await deleteSet(data.id);
        nav('/global-adapter-values-sets');
    }

    useEffect(() => {
        fetchData()
    }, [id]);

    const onChange = (key: keyof GlobalAdapterValuesSetModel, value: any) => {
        setData({
            ...data!,
            [key]: value
        })
    }

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

    if (!data)
        return <></>;

    return <div className={"flex flex-col mt-3"}>
        {showDeleteDialog && (
            <Dialog
                onCancel={() => setShowDeleteDialog(false)}
                onConfirm={onDelete}
                title={`Are you sure you want to delete "${data.name}"? This action cannot be undone.`}
            />
        )}
        <div className="flex flex-col w-full md:w-[650px]">
            <div className="w-full flex flex-col gap-5">
                <FormField title="ID" className="grow">
                    <TextEditor value={data?.id} disabled={true}/>
                </FormField>
                <FormField title="Name" className="grow">
                    <TextEditor value={data?.name} onChange={(t) => onChange("name", t)}/>
                </FormField>
            </div>

            <div className={"bg-white p-4 rounded-lg shadow-lg mt-5"}>
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
            </div>

            <div className={"flex w-full flex-row-reverse gap-2 mt-8"}>
                <Authorize roles={["Admin", "Member"]}>
                    <Button
                        onClick={onUpdate}
                    >Save
                    </Button>
                </Authorize>

                <Authorize roles={["Admin"]}>
                    <Button
                        variant={"secondary"}
                        onClick={() => setShowDeleteDialog(true)}
                    >Delete
                    </Button>
                </Authorize>

                <Button
                    variant={"secondary"}
                    onClick={() => nav('/global-adapter-values-sets')}
                >Cancel
                </Button>
            </div>
        </div>
    </div>
}

export default GlobalAdapterValuesSet;
