import React, {useCallback, useEffect, useState} from "react";
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
                                                 promotedProperties
                                             }) => {


    const [keyOptions, setKeyOptions] = useState<Array<OptionType>>([])
    useEffect(() => {

        (async () => {
            if (!documentId)
                return;


            const data = await apiClient.findDocument(documentId);
            if (data.succeeded) {
                const k = ((data?.data?.promotedProperties as Array<KeyValuePair>).map((i) => ({
                    id: i.key,
                    title: i.value
                }))) as OptionType[]
                setKeyOptions(k)
            }


        })()

    }, [documentId, promotedProperties])

    const onAddFilter = useCallback((newVal: KeyValuePair) => {

        const data = [...(promotedProperties ?? []), newVal]
        onChange(data)
    }, [onChange, promotedProperties])


    const onRemoveFilter = useCallback((newVal: KeyValuePair) => {
        const data = promotedProperties?.filter(x => x.key != newVal.key) ?? []
        onChange(data)
    }, [onChange, promotedProperties])


    return (<div>
        <KeyValueEditor values={documentFilter} title={'Properties'}
                        keyLabel={"Name"} valueLabel={"Value"}
                        onAdd={onAddFilter} onRemove={onRemoveFilter}
                        addLabel={"Add or edit"}
                        keyOptions={keyOptions}
        />
    </div>)
}
export default SubscriptionFilter