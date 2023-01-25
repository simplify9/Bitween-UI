import React, {useEffect, useState} from "react";
import {KeyValuePair, OptionType} from "src/types/common";
import KeyValueEditor from "src/components/common/forms/KeyValueEditor";
import {apiClient} from "src/client";

type Props = {
    documentFilter?: Array<KeyValuePair> | undefined
    promotedProperties?: Array<KeyValuePair>
    onChange: (arr: Array<KeyValuePair>) => void
    documentId: string | undefined
}
const SubscriptionFilter: React.FC<Props> = ({
                                                 documentId,
                                                 onChange,
                                                 documentFilter,
                                                 //   promotedProperties
                                             }) => {


    const [keyOptions, setKeyOptions] = useState<Array<OptionType>>([])


    const onAddFilter = (newVal: KeyValuePair) => {
        console.log(new Date().getMilliseconds(),"onAddFilter")
        const data = [...(documentFilter ?? []), newVal]
        onChange(data)
    }


    const onRemoveFilter = (newVal: KeyValuePair) => {
        console.log(new Date().getMilliseconds(),"onRemoveFilter")
        const data = documentFilter?.filter(x => !(x.key == newVal.key && x.value == newVal.value)) ?? []
        onChange(data)
    }

    const loadData = async () => {
        if (!documentId)
            return;
        const data = await apiClient.findDocument(documentId);
        if (data.succeeded) {
            const k = ((data?.data?.promotedProperties as Array<KeyValuePair>)
                //?.filter(i => documentFilter?.some(i => i.key != i.key))
                .map((i) => ({
                    id: i.key,
                    title: i.value
                }))) as OptionType[]
            setKeyOptions(k)
        }


    }
    useEffect(() => {

        loadData()

    }, [documentId])


    //console.log("documentFilter", documentFilter)
    return (
        <KeyValueEditor values={documentFilter} title={'Properties'}
                        keyLabel={"Name"} valueLabel={"Value"}
                        onAdd={onAddFilter} onRemove={onRemoveFilter}
                        addLabel={"Add or edit"}
                        keyOptions={keyOptions}
        />
    )
}
export default React.memo(SubscriptionFilter)