import React from "react";
import AdapterEditor from "src/components/Subscriptions/AdapterEditor";
import {
    RetryAlertMode,
    pairsFromRecord,
    recordFromPairs
} from "src/types/retryPolicies";

export interface RetryAlertValue {
    alertMode: RetryAlertMode
    alertHandlerId?: string | null
    alertHandlerProperties?: Record<string, string> | null
}

interface Props {
    value: RetryAlertValue
    onChange: (value: RetryAlertValue) => void
    /** What "Inherit" resolves to at the level above, e.g. "the policy default". */
    inheritedFrom: string
    /** The handler that level uses, so inheriting can be described rather than just named. */
    inheritedHandlerId?: string | null
    inheritedProperties?: Record<string, string> | null
    title?: string
}

const modes: { mode: RetryAlertMode, label: string }[] = [
    {mode: RetryAlertMode.Inherit, label: "Inherit"},
    {mode: RetryAlertMode.Send, label: "Send via…"},
    {mode: RetryAlertMode.Silent, label: "Silent"},
];

// A level that overrides REPLACES the level above rather than merging into it, so choosing
// "Send via…" means re-entering the handler and every property it needs. That is what the
// "copy from" button is for — otherwise the api key gets retyped by hand and eventually typo'd.
const RetryAlertEditor: React.FC<Props> = ({
                                               value,
                                               onChange,
                                               inheritedFrom,
                                               inheritedHandlerId,
                                               inheritedProperties,
                                               title = "Budget exhausted alert"
                                           }) => {

    const mode = value.alertMode ?? RetryAlertMode.Inherit;

    const setMode = (next: RetryAlertMode) => {
        // Leaving Send behind drops its handler, so a level that no longer sends cannot keep
        // stale config that the UI would still show.
        if (next === RetryAlertMode.Send)
            onChange({...value, alertMode: next});
        else
            onChange({alertMode: next, alertHandlerId: null, alertHandlerProperties: null});
    };

    const copyFromInherited = () => onChange({
        alertMode: RetryAlertMode.Send,
        alertHandlerId: inheritedHandlerId,
        alertHandlerProperties: inheritedProperties ?? {}
    });

    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-sm tracking-wide text-gray-700 font-semibold uppercase">{title}</h3>

            <div className="flex flex-row gap-2">
                {modes.map(m => (
                    <button key={m.mode} type="button"
                            onClick={() => setMode(m.mode)}
                            className={`px-3 py-1 rounded text-sm border transition ${mode === m.mode
                                ? "bg-primary-600 text-white border-primary-600"
                                : "bg-white text-gray-600 border-gray-300 hover:border-primary-400"}`}>
                        {m.label}
                    </button>
                ))}
            </div>

            {mode === RetryAlertMode.Inherit &&
                <p className="text-xs text-gray-500">
                    {inheritedHandlerId
                        ? <>Uses {inheritedFrom} — <span className="font-mono">{inheritedHandlerId}</span>.</>
                        : <>Follows {inheritedFrom}, which currently sends no alert.</>}
                </p>}

            {mode === RetryAlertMode.Silent &&
                <p className="text-xs text-gray-500">
                    Sends nothing, even when {inheritedFrom} defines an alert.
                </p>}

            {mode === RetryAlertMode.Send && <>
                <div className="flex flex-row items-center justify-between gap-2">
                    <p className="text-xs text-gray-500">
                        Replaces {inheritedFrom} entirely — set the handler and all of its properties here.
                    </p>
                    {inheritedHandlerId &&
                        <button type="button" onClick={copyFromInherited}
                                className="shrink-0 text-xs text-primary-600 hover:underline">
                            Copy from {inheritedFrom}
                        </button>}
                </div>
                <AdapterEditor title="Alert handler" type="handlers"
                               value={value.alertHandlerId}
                               onChange={(v) => onChange({...value, alertHandlerId: v})}
                               props={pairsFromRecord(value.alertHandlerProperties)}
                               onPropsChange={(p) => onChange({
                                   ...value,
                                   alertHandlerProperties: recordFromPairs(p)
                               })}/>
            </>}
        </div>
    );
}

export default RetryAlertEditor;
