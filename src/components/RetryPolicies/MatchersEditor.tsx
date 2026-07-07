import React, {useState} from "react";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import TextEditor from "src/components/common/forms/TextEditor";
import CheckBoxEditor from "src/components/common/forms/CheckBoxEditor";
import Button from "src/components/common/forms/Button";
import FieldTooltip from "src/components/common/forms/FieldTooltip";
import {MdOutlineRemoveCircle} from "react-icons/md";
import {JsonPathOp, Matcher, jsonPathOpOptions, matcherTypeOptions} from "src/types/retryPolicies";
import {OptionType} from "src/types/common";

interface Props {
    matchers: Matcher[]
    onChange: (matchers: Matcher[]) => void
}

const defaultDraftFor = (type: string): Matcher => {
    switch (type) {
        case "regex":
            return {type: "regex", pattern: "", flags: "i"};
        case "exceptionType":
            return {type: "exceptionType", value: "", includeInner: true};
        case "jsonPath":
            return {type: "jsonPath", path: "", op: JsonPathOp.Eq, value: ""};
        default:
            return {type: "contains", value: "", caseSensitive: false};
    }
}

export const summarizeMatcher = (m: Matcher): string => {
    switch (m.type) {
        case "contains":
            return `Contains "${m.value}"${m.caseSensitive ? " (case-sensitive)" : ""}`;
        case "regex":
            return `Regex /${m.pattern}/${m.flags ?? ""}`;
        case "exceptionType":
            return `Exception type "${m.value}"${m.includeInner === false ? " (top-level only)" : ""}`;
        case "jsonPath":
            return `${m.path} ${jsonPathOpOptions.find(o => o.id === m.op)?.title ?? m.op} ${m.value ?? ""}`.trim();
        default:
            return "";
    }
}

const MatchersEditor: React.FC<Props> = ({matchers, onChange}) => {

    const [draft, setDraft] = useState<Matcher>(defaultDraftFor("contains"));

    const onChangeDraftType = (type: string) => {
        setDraft(defaultDraftFor(type));
    }

    const onChangeDraftField = (key: string, value: any) => {
        setDraft((d) => ({...d, [key]: value} as Matcher));
    }

    const onAdd = () => {
        onChange([...(matchers ?? []), draft]);
        setDraft(defaultDraftFor("contains"));
    }

    const onRemove = (index: number) => {
        onChange((matchers ?? []).filter((_, i) => i !== index));
    }

    return (
        <div className={"flex flex-col gap-2"}>
            {(matchers ?? []).map((m, i) => (
                <div key={`matcher-${i}`} className={"flex flex-row items-center justify-between bg-gray-50 border rounded px-3 py-2"}>
                    <span className={"text-sm text-gray-800"}>{summarizeMatcher(m)}</span>
                    <Button variant={"none"} onClick={() => onRemove(i)}>
                        <MdOutlineRemoveCircle className={"text-red-600"} size={19}/>
                    </Button>
                </div>
            ))}

            <div key="draft-row" className={"flex flex-row flex-wrap items-end gap-2 mt-1"}>
                <div className={"w-40"}>
                    <div className={"flex flex-row items-center mb-1"}>
                        <span className={"text-xs text-gray-500"}>Matcher type</span>
                        <FieldTooltip content="What kind of condition to check: text contains a substring, a regex pattern, an exception type name, or a JSON path expression against the response body."/>
                    </div>
                    <ChoiceEditor
                        value={draft.type}
                        onChange={onChangeDraftType}
                        options={matcherTypeOptions}
                        optionTitle={(o: OptionType) => o.title}
                        optionValue={(o: OptionType) => o.id}
                        isClearable={false}
                    />
                </div>

                {draft.type === "contains" && (
                    <>
                        <TextEditor placeholder={"Value"} value={draft.value}
                                    onChange={(v) => onChangeDraftField("value", v)}/>
                        <div className={"flex flex-row items-center"}>
                            <CheckBoxEditor label={"Case sensitive"} checked={draft.caseSensitive}
                                            onChange={(v) => onChangeDraftField("caseSensitive", v)}/>
                            <FieldTooltip content="When off, matching ignores letter case." className="ml-1 mb-3"/>
                        </div>
                    </>
                )}

                {draft.type === "regex" && (
                    <>
                        <TextEditor placeholder={"Pattern"} value={draft.pattern}
                                    onChange={(v) => onChangeDraftField("pattern", v)}/>
                        <TextEditor placeholder={"Flags"} value={draft.flags}
                                    onChange={(v) => onChangeDraftField("flags", v)}/>
                    </>
                )}

                {draft.type === "exceptionType" && (
                    <>
                        <TextEditor placeholder={"Exception type name"} value={draft.value}
                                    onChange={(v) => onChangeDraftField("value", v)}/>
                        <div className={"flex flex-row items-center"}>
                            <CheckBoxEditor label={"Include inner"} checked={draft.includeInner}
                                            onChange={(v) => onChangeDraftField("includeInner", v)}/>
                            <FieldTooltip content="Also match against inner (wrapped) exception types, not just the outermost exception." className="ml-1 mb-3"/>
                        </div>
                    </>
                )}

                {draft.type === "jsonPath" && (
                    <>
                        <div>
                            <div className={"flex flex-row items-center mb-1"}>
                                <span className={"text-xs text-gray-500"}>JSON path</span>
                                <FieldTooltip content={
                                    'Only applies to "Bad result" failures, and is checked against the response body ' +
                                    '(must be valid JSON) — not against exceptions. Supports dot-notation and array ' +
                                    'indexers, e.g. $.status or $.errors[0].code.\n\n' +
                                    'Example: for a response of {"status":"FAILED","errors":[{"code":500}]} — ' +
                                    'path $.status with "Equals" FAILED matches; path $.errors[0].code with "Equals" 500 also matches.'
                                }/>
                            </div>
                            <TextEditor placeholder={"$.path"} value={draft.path}
                                        onChange={(v) => onChangeDraftField("path", v)}/>
                        </div>
                        <div className={"w-40"}>
                            <ChoiceEditor
                                value={draft.op}
                                onChange={(v) => onChangeDraftField("op", v)}
                                options={jsonPathOpOptions}
                                optionTitle={(o: OptionType) => o.title}
                                optionValue={(o: OptionType) => o.id}
                                isClearable={false}
                            />
                        </div>
                        {draft.op !== JsonPathOp.Exists && draft.op !== JsonPathOp.NotExists && (
                            <TextEditor placeholder={"Value"} value={draft.value}
                                        onChange={(v) => onChangeDraftField("value", v)}/>
                        )}
                    </>
                )}

                <Button variant={"secondary"} onClick={onAdd}>Add matcher</Button>
            </div>
        </div>
    );
}

export default MatchersEditor;
