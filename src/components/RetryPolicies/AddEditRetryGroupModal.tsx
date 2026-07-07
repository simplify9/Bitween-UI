import React, {useState} from "react";
import Modal from "src/components/common/Modal";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import CheckBoxEditor from "src/components/common/forms/CheckBoxEditor";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import FieldTooltip from "src/components/common/forms/FieldTooltip";
import MatchersEditor from "src/components/RetryPolicies/MatchersEditor";
import {OptionType} from "src/types/common";
import {
    DelayStrategy,
    RetryAction,
    RetryGroup,
    XchangeResultType,
    delayStrategyTypeOptions,
    retryActionOptions
} from "src/types/retryPolicies";

type Props = {
    visible: boolean
    onClose: () => void
    onAdd: (group: RetryGroup) => void
    initial?: RetryGroup
}

const emptyGroup = (): RetryGroup => ({
    id: crypto.randomUUID(),
    name: "",
    priority: 10,
    enabled: true,
    appliesTo: [XchangeResultType.Error],
    matchers: [],
    action: RetryAction.Allow,
    budget: {
        maxAttemptsPerError: 3,
        maxAttemptsTotal: 10,
        delayStrategy: {type: "fixed", delayMs: 5000}
    },
    notes: ""
})

// The UI only ever collects/displays delay strategy times in seconds — storage
// (and the backend) keeps working in milliseconds, so convert at the boundary.
const msToSeconds = (ms: number | undefined): number | undefined =>
    ms === undefined || ms === null ? ms : ms / 1000;

const secondsToMs = (seconds: any): number =>
    Number(seconds) * 1000;

const defaultDelayStrategyFor = (type: string): DelayStrategy => {
    switch (type) {
        case "linear":
            return {type: "linear", initialDelayMs: 1000, incrementMs: 500};
        case "exponential":
            return {type: "exponential", initialDelayMs: 1000, multiplier: 2, maxDelayMs: 30000};
        default:
            return {type: "fixed", delayMs: 5000};
    }
}

const AddEditRetryGroupModal: React.FC<Props> = ({visible, onClose, onAdd, initial}) => {

    const [group, setGroup] = useState<RetryGroup>(initial ?? emptyGroup());

    const onChangeField = (key: keyof RetryGroup, value: any) => {
        setGroup((g) => ({...g, [key]: value}));
    }

    const toggleAppliesTo = (type: XchangeResultType) => {
        setGroup((g) => {
            const has = g.appliesTo?.includes(type);
            return {
                ...g,
                appliesTo: has
                    ? g.appliesTo.filter(t => t !== type)
                    : [...(g.appliesTo ?? []), type]
            }
        });
    }

    const onChangeDelayStrategyType = (type: string) => {
        setGroup((g) => ({
            ...g,
            budget: {
                maxAttemptsPerError: g.budget?.maxAttemptsPerError ?? 3,
                maxAttemptsTotal: g.budget?.maxAttemptsTotal ?? 10,
                delayStrategy: defaultDelayStrategyFor(type)
            }
        }));
    }

    const onChangeDelayStrategyField = (key: string, value: any) => {
        setGroup((g) => ({
            ...g,
            budget: {
                maxAttemptsPerError: g.budget?.maxAttemptsPerError ?? 3,
                maxAttemptsTotal: g.budget?.maxAttemptsTotal ?? 10,
                delayStrategy: {...(g.budget?.delayStrategy as any), [key]: value}
            }
        }));
    }

    const onChangeBudgetField = (key: "maxAttemptsPerError" | "maxAttemptsTotal", value: any) => {
        setGroup((g) => ({
            ...g,
            budget: {
                maxAttemptsPerError: g.budget?.maxAttemptsPerError ?? 3,
                maxAttemptsTotal: g.budget?.maxAttemptsTotal ?? 10,
                delayStrategy: g.budget?.delayStrategy ?? {type: "fixed", delayMs: 5000},
                [key]: value
            }
        }));
    }

    const onSubmit = () => {
        onAdd(group);
        onClose();
    }

    if (!visible) return null;

    return <Modal onClose={onClose} submitLabel={initial ? "Save" : "Add"} onSubmit={onSubmit}>
        <div className={"flex flex-row gap-5"}>
            <FormField title="Name" tooltip="A label for this rule, shown in the groups list and in retry decision logs." className="grow">
                <TextEditor value={group.name} onChange={(v) => onChangeField("name", v)}/>
            </FormField>
            <FormField title="Priority" tooltip="Lower numbers are evaluated first. Leave gaps (10, 20, 30…) so new groups can be inserted later without renumbering." className="w-32">
                <TextEditor type={"number"} value={group.priority}
                            onChange={(v) => onChangeField("priority", Number(v))}/>
            </FormField>
        </div>

        <div className={"mt-3 flex flex-row items-center"}>
            <CheckBoxEditor label={"Enabled"} checked={group.enabled}
                            onChange={(v) => onChangeField("enabled", v)}/>
            <FieldTooltip content="When off, this group is skipped entirely during evaluation — matchers, action, and budget are all ignored." className="ml-1 mb-3"/>
        </div>

        <FormField title="Applies to" tooltip="Which kind of failure this group handles. Error: an exception was thrown. Bad result: the handler ran but its response failed validation." className="grow mt-3">
            <div className={"flex flex-row gap-5"}>
                <CheckBoxEditor label={"Error"} checked={group.appliesTo?.includes(XchangeResultType.Error)}
                                onChange={() => toggleAppliesTo(XchangeResultType.Error)}/>
                <CheckBoxEditor label={"Bad result"} checked={group.appliesTo?.includes(XchangeResultType.BadResult)}
                                onChange={() => toggleAppliesTo(XchangeResultType.BadResult)}/>
            </div>
        </FormField>

        <FormField title="Action" tooltip="Allow schedules a retry according to the budget below. Block hard-stops retries for this failure, even if a budget would otherwise allow one." className="grow mt-3 w-48">
            <ChoiceEditor
                value={group.action}
                onChange={(v) => onChangeField("action", v)}
                options={retryActionOptions}
                optionTitle={(o: OptionType) => o.title}
                optionValue={(o: OptionType) => o.id}
                isClearable={false}
            />
        </FormField>

        <FormField title="Matchers" tooltip="Conditions checked against the failure content (exception text for Error, response body for Bad result). The group fires as soon as any one matcher matches (OR logic)." className="grow mt-3">
            <MatchersEditor matchers={group.matchers} onChange={(m) => onChangeField("matchers", m)}/>
        </FormField>

        {group.action === RetryAction.Allow && (
            <div className={"mt-5 border-t pt-3"}>
                <h6 className={"mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase"}>Retry budget</h6>
                <div className={"flex flex-row gap-5"}>
                    <FormField title="Max attempts per error" tooltip="Maximum retry attempts for a single failing message within this group, before giving up on it." className="grow">
                        <TextEditor type={"number"} value={group.budget?.maxAttemptsPerError}
                                    onChange={(v) => onChangeBudgetField("maxAttemptsPerError", Number(v))}/>
                    </FormField>
                    <FormField title="Max attempts total" tooltip="Hard ceiling on total retries across all messages hitting this group, so a burst of failures can't overwhelm the downstream system." className="grow">
                        <TextEditor type={"number"} value={group.budget?.maxAttemptsTotal}
                                    onChange={(v) => onChangeBudgetField("maxAttemptsTotal", Number(v))}/>
                    </FormField>
                </div>

                <FormField title="Delay strategy" tooltip="How the wait time before each retry attempt is calculated." className="grow mt-3 w-48">
                    <ChoiceEditor
                        value={group.budget?.delayStrategy?.type}
                        onChange={onChangeDelayStrategyType}
                        options={delayStrategyTypeOptions}
                        optionTitle={(o: OptionType) => o.title}
                        optionValue={(o: OptionType) => o.id}
                        isClearable={false}
                    />
                </FormField>

                <div className={"flex flex-row gap-5 mt-3"}>
                    {group.budget?.delayStrategy?.type === "fixed" && (
                        <FormField title="Delay (seconds)" tooltip="Constant wait time before every retry attempt." className="grow">
                            <TextEditor type={"number"} value={msToSeconds((group.budget.delayStrategy as any).delayMs)}
                                        onChange={(v) => onChangeDelayStrategyField("delayMs", secondsToMs(v))}/>
                        </FormField>
                    )}
                    {group.budget?.delayStrategy?.type === "linear" && (
                        <>
                            <FormField title="Initial delay (seconds)" tooltip="Wait time before the first retry attempt." className="grow">
                                <TextEditor type={"number"} value={msToSeconds((group.budget.delayStrategy as any).initialDelayMs)}
                                            onChange={(v) => onChangeDelayStrategyField("initialDelayMs", secondsToMs(v))}/>
                            </FormField>
                            <FormField title="Increment (seconds)" tooltip="Extra time added to the delay on each successive attempt (attempt N waits initial + N × increment)." className="grow">
                                <TextEditor type={"number"} value={msToSeconds((group.budget.delayStrategy as any).incrementMs)}
                                            onChange={(v) => onChangeDelayStrategyField("incrementMs", secondsToMs(v))}/>
                            </FormField>
                        </>
                    )}
                    {group.budget?.delayStrategy?.type === "exponential" && (
                        <>
                            <FormField title="Initial delay (seconds)" tooltip="Wait time before the first retry attempt." className="grow">
                                <TextEditor type={"number"} value={msToSeconds((group.budget.delayStrategy as any).initialDelayMs)}
                                            onChange={(v) => onChangeDelayStrategyField("initialDelayMs", secondsToMs(v))}/>
                            </FormField>
                            <FormField title="Multiplier" tooltip="Growth factor applied to the delay on each attempt — e.g. 2 doubles the wait time every retry." className="grow">
                                <TextEditor type={"number"} value={(group.budget.delayStrategy as any).multiplier}
                                            onChange={(v) => onChangeDelayStrategyField("multiplier", Number(v))}/>
                            </FormField>
                            <FormField title="Max delay (seconds)" tooltip="Upper bound on the computed delay, no matter how many attempts have occurred." className="grow">
                                <TextEditor type={"number"} value={msToSeconds((group.budget.delayStrategy as any).maxDelayMs)}
                                            onChange={(v) => onChangeDelayStrategyField("maxDelayMs", secondsToMs(v))}/>
                            </FormField>
                        </>
                    )}
                </div>
            </div>
        )}

        <FormField title="Notes" tooltip="Optional free-text notes visible to other admins managing this policy." className="grow mt-3">
            <TextEditor value={group.notes ?? ""} onChange={(v) => onChangeField("notes", v)}/>
        </FormField>
    </Modal>
}

export default AddEditRetryGroupModal;
