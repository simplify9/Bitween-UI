import {ChoiceEditor} from "../common/forms/ChoiceEditor";
import {useVersionedAdaptersQuery} from "src/client/apis/generalApi";
import React, {useCallback, useMemo, useState} from "react";


interface Props {
    value?: string
    onChange: (value: string) => void
    type: 'mappers' | 'receivers' | 'handlers' | 'notifiers' | 'validators'
}



const removeVersion = (key: string) => {
    if (!key)
        return ""
    if (!key.includes("/"))
        return key

    return key.split("/")[0]

}

const AdapterVersionSelector: React.FC<Props> = ({value, onChange, type}) => {

    const queryState = useVersionedAdaptersQuery({prefix: type});
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const options = useMemo(() => {
        if (!Array.isArray(queryState.data))
            return []
        return queryState.data.map(i => ({
            key: i.key,
            title: i.versions.length === 0 ? `${i.key} (Unversioned)` : removeVersion(i.key)
        }))

    }, [queryState.data])
    const mainValue = useMemo(() => {
        if (!Array.isArray(queryState.data))
            return ""
        return queryState.data.find(i => i.key == removeVersion(value))?.key
    }, [queryState.data, value])

    const versions = useMemo(() => {
        if (!Array.isArray(queryState.data))
            return []
        return queryState.data.find(i => i.key == removeVersion(mainValue))?.versions?.map(i => ({
            key: i.key,
            title: (i.key)
        })) ?? []
    }, [queryState.data, mainValue])


    const onChangeAdapter = useCallback((e: string) => {
        if (!e) {
            setShowClearConfirm(true);
            return;
        }
        setShowClearConfirm(false);
        const adapter = queryState.data.find(i => i.key == removeVersion(e))
        if (!adapter) return;
        if (adapter.versions.length === 0) {
            onChange(e)
        } else {
            onChange(adapter.versions.at(-1).key)
        }
    }, [queryState.data, onChange])

    const onChangeVersion = useCallback((e: string) => {
        onChange(e)
    }, [queryState.data, onChange])
    if (!Array.isArray(queryState.data))
        return null
    return (
        <div className={"flex flex-col gap-2"}>
            <ChoiceEditor
                placeholder="Select Adapter"
                value={mainValue}
                onChange={onChangeAdapter}
                options={options}
                optionValue={i => i.key}
                optionTitle={i => i.title}
                isClearable={!showClearConfirm}
            />
            {showClearConfirm && (
                <div className="flex items-center gap-2 px-2 py-1.5 bg-red-50 border border-red-200 rounded text-sm">
                    <span className="text-red-600 text-xs font-medium flex-1">Remove this adapter?</span>
                    <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-2 py-0.5 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onChange(undefined); setShowClearConfirm(false); }}
                        className="px-2 py-0.5 text-xs rounded border border-red-400 bg-red-500 hover:bg-red-600 text-white transition"
                    >
                        Remove
                    </button>
                </div>
            )}
            <div className={"flex flex-row flex-wrap w-full gap-2"}>
                {
                    versions.length > 0 &&
                    versions.map(
                        i => <div
                            key={i.key}
                            onClick={() => onChangeVersion(i.key)}
                            className={`cursor-pointer text-sm px-3 rounded-full py-1 text-white ${value === i.key ? 'bg-red-600 shadow-lg' : ' bg-gray-600'}`}
                        >
                            {i.key.split("/").at(-1)}
                        </div>
                    )
                }
            </div>
        </div>

    );
}

export default AdapterVersionSelector;
