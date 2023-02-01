import React, {useEffect, useState} from "react";
import {KeyValuePair, OptionType} from "src/types/common";
import KeyValueEditor from "src/components/common/forms/KeyValueEditor";
import {apiClient} from "src/client";

type Props = {
    documentFilter?: Array<KeyValuePair> | undefined
    onChange: (arr: Array<KeyValuePair>) => void
    documentId: string | undefined
}
const SubscriptionFilter: React.FC<Props> = ({
                                                 documentId,
                                                 onChange,
                                                 documentFilter,
                                             }) => {


    const [keyOptions, setKeyOptions] = useState<Array<OptionType>>([])


    const onAddFilter = (newVal: KeyValuePair) => {
        const data = [...(documentFilter ?? []), newVal]
        onChange(data)
    }


    const onEditFilter = (newVal: KeyValuePair) => {
        const data = documentFilter?.filter(x => !(x.key == newVal.key)).concat(newVal) ?? []
        onChange(data)
    }
    const onRemoveFilter = (newVal: KeyValuePair) => {
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


    return (
        <KeyValueEditor values={documentFilter} title={'Properties'}
                        keyLabel={"Name"} valueLabel={"Value"}
                        onAdd={onAddFilter} onRemove={onRemoveFilter}
                        addLabel={"Add or edit"}
                        onEdit={onEditFilter}
                        keyOptions={keyOptions}
        />
    )
}
export default React.memo(SubscriptionFilter)