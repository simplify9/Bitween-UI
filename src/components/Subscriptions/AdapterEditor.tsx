import FormField from "../common/forms/FormField";
import AdapterSelector from "./AdapterSelector";
import React, {useEffect, useState} from "react";
import {apiClient} from "../../client";
import {KeyValuePair, OptionType} from "../../types/common";
import KeyValueEditor from "../common/forms/KeyValueEditor";
import {toLocalDateTimeString} from "src/utils/DateUtils";
import AdapterVersionSelector from "src/components/Subscriptions/AdapterVersionSelector";
import {useGlobalAdapterValuesSetsQuery} from "src/client/apis/globalAdapterValuesSetsApi";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import {useAdapterStartupValuesQuery} from "src/client/apis/generalApi";

type ValueMode = "static" | "global" | "partner";

interface ValueEditorProps {
    value: string;
    onChange: (v: string) => void;
}

const ValueEditor: React.FC<ValueEditorProps> = ({value: val, onChange: onValChange}) => {
    const globalValuesSets = useGlobalAdapterValuesSetsQuery({offset: 0, limit: 1000});

    const detectMode = (v: string): ValueMode => {
        if (v?.startsWith("{{globals.")) return "global";
        if (v?.startsWith("{{partner.")) return "partner";
        return "static";
    };

    const [mode, setMode] = useState<ValueMode>(detectMode(val));
    const [globalSetId, setGlobalSetId] = useState<string>(() => {
        const m = val?.match(/^\{\{globals\.([^.]+)\.([^}]+)\}\}$/);
        return m ? m[1] : "";
    });
    const [globalKey, setGlobalKey] = useState<string>(() => {
        const m = val?.match(/^\{\{globals\.([^.]+)\.([^}]+)\}\}$/);
        return m ? m[2] : "";
    });
    const [partnerKey, setPartnerKey] = useState<string>(() => {
        const m = val?.match(/^\{\{partner\.([^}]+)\}\}$/);
        return m ? m[1] : "";
    });

    const selectedSet = globalValuesSets.data?.result?.find(s => s.id === globalSetId);
    const globalKeyOptions: OptionType[] = selectedSet
        ? Object.keys(selectedSet.values).map(k => ({id: k, title: k}))
        : [];
    const globalSetOptions: OptionType[] = (globalValuesSets.data?.result ?? []).map(s => ({id: s.id, title: s.name}));

    const onModeChange = (m: ValueMode) => {
        setMode(m);
        setGlobalSetId("");
        setGlobalKey("");
        setPartnerKey("");
        onValChange("");
    };

    const onGlobalSetChange = (id: string) => {
        setGlobalSetId(id);
        setGlobalKey("");
        onValChange(`{{globals.${id}.}}`);
    };

    const onGlobalKeyChange = (k: string) => {
        setGlobalKey(k);
        onValChange(`{{globals.${globalSetId}.${k}}}`);
    };

    const onPartnerKeyChange = (k: string) => {
        setPartnerKey(k);
        onValChange(`{{partner.${k}}}`);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
                {(["static", "global", "partner"] as ValueMode[]).map(m => (
                    <button key={m} type="button"
                            onClick={() => {
                                onModeChange(m)
                            }}
                            className={`px-3 py-1 rounded text-sm border transition ${mode === m ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-600 border-gray-300 hover:border-primary-400"}`}>
                        {m === "static" ? "Static" : m === "global" ? "Global Value" : "Partner Property"}
                    </button>
                ))}
            </div>
            {mode === "static" && (
                <textarea className="w-full border rounded-md shadow p-1"
                          value={val?.startsWith("{{globals.") || val?.startsWith("{{partner.") ? "" : val}
                          onChange={e => onValChange(e.target.value)}/>
            )}
            {mode === "global" && (
                <div className="flex flex-row gap-2">
                    <div className="w-1/2">
                        <select
                            className="w-full border rounded-md shadow p-2 text-sm bg-white"
                            value={globalSetId}
                            onChange={e => onGlobalSetChange(e.target.value)}
                        >
                            <option value="">Select Global Values Set</option>
                            {globalSetOptions.map(o => (
                                <option key={o.id} value={o.id}>{o.title}</option>
                            ))}
                        </select>
                    </div>
                    {globalSetId && (
                        <div className="w-1/2">
                            <select
                                className="w-full border rounded-md shadow p-2 text-sm bg-white"
                                value={globalKey}
                                onChange={e => onGlobalKeyChange(e.target.value)}
                            >
                                <option value="">Select Key</option>
                                {globalKeyOptions.map(o => (
                                    <option key={o.id} value={o.id}>{o.title}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
            {mode === "partner" && (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                        <span>⚙</span>
                        <span>Value will be resolved from the partner's adapter property at runtime</span>
                    </div>
                    <div className="flex items-center border rounded-md shadow overflow-hidden">
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-sm border-r select-none">{`{{partner.`}</span>
                        <input
                            className="flex-1 p-1 text-sm outline-none"
                            placeholder="property key"
                            value={partnerKey}
                            onChange={e => onPartnerKeyChange(e.target.value)}
                        />
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-sm border-l select-none">{`}}`}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

interface Props {
    value?: string | null
    modifiedOn?: string
    onChange: (value: string | null) => void
    type: 'mappers' | 'receivers' | 'handlers' | 'notifiers' | 'validators'
    props?: KeyValuePair[],
    onPropsChange?: (p: KeyValuePair[]) => void
    title: string;
    suppressProps?: boolean;
    privateKeys?: Set<string>;
}

const AdapterEditor: React.FC<Props> = ({
                                            value,
                                            onChange,
                                            type,
                                            title,
                                            props,
                                            onPropsChange,
                                            modifiedOn,
                                            suppressProps
                                        }) => {

    const [adapterPropsOptions, setAdapterPropsOptions] = useState<OptionType[]>();
    const startupValuesQuery = useAdapterStartupValuesQuery(value!, {skip: !value});

    const privateKeys: Set<string> = React.useMemo(() => {
        if (!startupValuesQuery.data) return new Set();
        return new Set(
            Object.entries(startupValuesQuery.data)
                .filter(([, sv]) => sv.private)
                .map(([k]) => k)
        );
    }, [startupValuesQuery.data]);

    useEffect(() => {
        if (value) {
            apiClient.findAdapterProperties(value)
                .then((r) => setAdapterPropsOptions(r));
        }
    }, [value]);

    const availableOptions = () => {
        return adapterPropsOptions?.filter(o => props?.find(x => x.key == o.id) == undefined);
    };

    const onAdd = (v: KeyValuePair) => {
        let pparr = props ?? [];
        pparr?.push(v);
        onPropsChange!(pparr);
    };

    const onEdit = (v: KeyValuePair) => {
        let pparr = props.filter(i => i.key != v.key) ?? [];
        pparr?.push(v);
        onPropsChange!(pparr);
    };

    const onRemove = (v: KeyValuePair) => {
        let pparr: KeyValuePair[] = [];
        props?.forEach(pp => {
            if (pp.value != v.value && pp.key != v.key) pparr.push(pp);
        });
        onPropsChange!(pparr);
    };

    return (
        <div className={""}>
            <div className={"flex flex-col gap-2"}>
                <div
                    className={"flex flex-row justify-between text-sm tracking-wide text-gray-700 font-semibold uppercase"}>
                    <h3>{title}</h3>
                    {
                        modifiedOn &&
                        <p className={"text-sm font-semibold uppercase"}>Modified
                            on: {toLocalDateTimeString(modifiedOn)}</p>
                    }
                </div>
                <FormField title={""} className="grow ">
                    <AdapterVersionSelector type={type} value={value} onChange={(v) => {
                        onChange(v);
                        if (!v) onPropsChange?.([]);
                    }}/>
                </FormField>
                <div className={"mb-1"}/>
                {!suppressProps && (() => {
                    if (value && (startupValuesQuery.isLoading || startupValuesQuery.isUninitialized))
                        return (
                            <div className="flex items-center gap-2 px-2 py-3 text-xs text-gray-400">
                                <svg className="animate-spin h-3.5 w-3.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                                Loading properties…
                            </div>
                        );
                    if (value && startupValuesQuery.isError)
                        return (
                            <div className="px-2 py-2 text-xs text-red-500 border border-red-200 rounded-md bg-red-50">
                                Could not load adapter metadata. Properties are hidden to protect sensitive values.
                            </div>
                        );
                    return (
                        <KeyValueEditor values={props} title={'Properties'}
                                        keyLabel={"Name"} valueLabel={"Value"}
                                        onAdd={onAdd} onRemove={onRemove}
                                        addLabel={"Add or edit"}
                                        onEdit={onEdit}
                                        keyOptions={availableOptions()}
                                        privateKeys={privateKeys}
                                        valueRenderer={(v, onVChange) => <ValueEditor value={v} onChange={onVChange}/>}
                        />
                    );
                })()}
            </div>
        </div>
    );
}

export default AdapterEditor;


