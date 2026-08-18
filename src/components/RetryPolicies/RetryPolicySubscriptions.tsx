import React, {useState} from "react";
import dayjs from "dayjs";
import {MdExpandMore, MdChevronRight} from "react-icons/md";
import {
    useResetRetryPolicyUsageMutation,
    useRetryPolicyUsageQuery,
    useSaveRetryAlertOverrideMutation
} from "src/client/apis/retryPoliciesApi";
import Button from "src/components/common/forms/Button";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import Tab from "src/components/common/forms/Tab";
import TabNavigator from "src/components/common/forms/TabNavigator";
import {DataListViewSettingsEditor} from "src/components/common/DataListViewSettingsEditor";
import Modal from "src/components/common/Modal";
import Authorize from "src/components/common/authorize/authorize";
import RetryAlertEditor, {RetryAlertValue} from "src/components/RetryPolicies/RetryAlertEditor";
import RetryGroupAttempts from "src/components/RetryPolicies/RetryGroupAttempts";
import {
    RetryAlertLevel,
    RetryAlertMode,
    RetryGroupUsageRow,
    retryAlertLevelLabels
} from "src/types/retryPolicies";

interface Props {
    policyId: number
}

// Spent budget and alert destination are keyed by the same subscription-and-group pair, so they
// belong on one row: the question worth asking about an exhausted budget is whether anyone was
// told, and answering it from two tables means matching them by eye.
//
// The server sorts worst-first — stopped retrying, then alerting nowhere, then most spent — so the
// rows that matter lead the table before any filter is touched.
type Filter = {
    id: string
    title: string
    // What the filter means, not only how many rows it has: a count says how many, not why to care.
    hint: string
    keep: (row: RetryGroupUsageRow) => boolean
}

const filters: Filter[] = [
    {
        id: "attention",
        title: "Needs attention",
        hint: "Budgets that have run out, and pairs whose alert would go nowhere.",
        keep: r => r.exhausted || !r.resolvedHandlerId
    },
    {
        id: "exhausted",
        title: "Exhausted",
        hint: "No longer being retried at all until the counter is reset.",
        keep: r => r.exhausted
    },
    {
        id: "noAlert",
        title: "No alert",
        hint: "No level configures an alert, or one silences it — running out will be invisible.",
        keep: r => !r.resolvedHandlerId
    },
    {
        id: "overridden",
        title: "Overridden",
        hint: "These pairs set their own alert instead of following the group or policy.",
        keep: r => r.alertMode !== RetryAlertMode.Inherit
    },
    {
        id: "all",
        title: "All",
        hint: "Every subscription and group using this policy, whether or not it has ever failed.",
        keep: () => true
    }
];

// Why nothing sends, short enough for a column. Which level silenced it matters: one subscription
// opting out and a whole group being switched off are different decisions.
const silenceLabels: Record<RetryAlertLevel, string> = {
    [RetryAlertLevel.SubscriptionGroup]: "Silenced (subscription)",
    [RetryAlertLevel.Group]: "Silenced (group)",
    [RetryAlertLevel.Policy]: "Silenced (policy)",
}

// Shared by the header and body cells so columns stay aligned as padding is tuned.
const cell = "px-3 py-1.5 whitespace-nowrap"

const keyOf = (row: RetryGroupUsageRow) => `${row.subscriptionId}-${row.groupId}`

const RetryPolicySubscriptions: React.FC<Props> = ({policyId}) => {

    const {data, isLoading, isError, refetch} = useRetryPolicyUsageQuery(policyId)
    const [reset] = useResetRetryPolicyUsageMutation()
    const [save] = useSaveRetryAlertOverrideMutation()

    const [filterId, setFilterId] = useState("attention")
    const [search, setSearch] = useState("")
    const [view, setView] = useState({offset: 0, limit: 10})
    // One open at a time: the panel adds rows below whichever row it belongs to, and several open
    // at once would push the rest of the table around unpredictably as each one loads.
    const [openKey, setOpenKey] = useState<string>()
    const [editing, setEditing] = useState<RetryGroupUsageRow | undefined>()
    const [draft, setDraft] = useState<RetryAlertValue | undefined>()

    const rows = data ?? []
    const filter = filters.find(f => f.id === filterId) ?? filters[0]

    const term = search.trim().toLowerCase()
    const searched = term
        ? rows.filter(r => r.subscriptionName?.toLowerCase().includes(term)
            || r.groupName?.toLowerCase().includes(term))
        : rows
    const matching = searched.filter(filter.keep)
    const visible = matching.slice(view.offset, view.offset + view.limit)

    // Narrowing the set has to send you back to the first page, or the offset can land past the end
    // and the table looks empty when it is not.
    const narrow = (change: () => void) => {
        change()
        setView(v => ({...v, offset: 0}))
    }

    const onEdit = (row: RetryGroupUsageRow) => {
        setEditing(row)
        setDraft({
            alertMode: row.alertMode ?? RetryAlertMode.Inherit,
            alertHandlerId: row.overrideHandlerId,
            alertHandlerProperties: row.overrideHandlerProperties
        })
    }

    const onSubmit = async () => {
        if (!editing || !draft) return
        await save({
            id: policyId,
            subscriptionId: editing.subscriptionId,
            groupId: editing.groupId,
            ...draft
        })
        setEditing(undefined)
        setDraft(undefined)
    }

    // What this pair would fall back to if its own override were removed — the group's setting when
    // the group sends or silences, otherwise the policy default. The backend walks the same order;
    // this only describes it.
    const inheritedDescription = (row: RetryGroupUsageRow) =>
        row.resolvedFrom === RetryAlertLevel.SubscriptionGroup
            ? "the group or policy setting"
            : row.resolvedFrom
                ? `the ${retryAlertLevelLabels[row.resolvedFrom].toLowerCase()} setting`
                : "the group and policy settings";

    return (
        <FormField title="Subscriptions"
                   tooltip="Every subscription and group using this policy: how much of the group's 'max attempts total' that subscription has spent, and where its budget-exhausted alert goes. Most specific wins for alerts — this subscription, then the group, then the policy. Groups that block retries are left out; they can never exhaust a budget.">

            {editing && draft &&
                <Modal onClose={() => setEditing(undefined)} submitLabel={"Save"} onSubmit={onSubmit}>
                    <p className={"text-sm text-gray-700 mb-3"}>
                        <span className={"font-semibold"}>{editing.subscriptionName}</span>
                        {" — "}
                        <span className={"font-semibold"}>{editing.groupName}</span>
                    </p>
                    <RetryAlertEditor value={draft} onChange={setDraft}
                                      inheritedFrom={inheritedDescription(editing)}
                                      inheritedHandlerId={
                                          editing.alertMode === RetryAlertMode.Inherit
                                              ? editing.resolvedHandlerId
                                              : undefined}
                                      inheritedProperties={
                                          editing.alertMode === RetryAlertMode.Inherit
                                              ? editing.resolvedHandlerProperties
                                              : undefined}/>
                </Modal>}

            {isLoading && <p className={"text-sm text-gray-400 italic px-2 py-3"}>Loading…</p>}

            {/* Never fall through to the empty state on failure: "nothing to worry about" would be a
                claim we cannot make when the truth is that we could not find out. */}
            {isError &&
                <div className={"flex flex-row items-center justify-between gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2"}>
                    <span>Could not load this policy's subscriptions.</span>
                    <Button variant={"secondary"} onClick={() => refetch()}>Try again</Button>
                </div>}

            {!isLoading && !isError && rows.length === 0 &&
                <p className={"text-sm text-gray-400 italic px-2 py-3"}>
                    No subscriptions use this policy yet.
                </p>}

            {!isError && rows.length > 0 && <div className={"flex flex-col gap-2"}>
                <TabNavigator>
                    {filters.map(f => {
                        const count = searched.filter(f.keep).length
                        return (
                            <Tab key={f.id} selected={f.id === filterId}
                                 onClick={() => narrow(() => setFilterId(f.id))}>
                                {f.title}
                                <span className={`ml-1.5 ${count > 0 && ["attention", "exhausted", "noAlert"].includes(f.id)
                                    ? "text-red-600" : "text-gray-400"}`}>
                                    {count}
                                </span>
                            </Tab>
                        )
                    })}
                </TabNavigator>

                <div className={"flex flex-row items-center justify-between gap-3"}>
                    <p className={"text-xs text-gray-500"}>{filter.hint}</p>
                    <TextEditor className={"w-[220px] shrink-0"} value={search}
                                placeholder={"Search subscription or group…"}
                                onChange={(t) => narrow(() => setSearch(t))}/>
                </div>

                {matching.length === 0
                    ? <p className={"text-sm text-gray-400 italic px-2 py-3"}>
                        {term
                            ? <>Nothing matches “{search}” here.</>
                            : <>Nothing here — {filter.title.toLowerCase()} is empty.</>}
                    </p>
                    /* A page at a time rather than a scrollbox: the row count stays predictable, so
                       the sections around this one do not move as the data grows. Only horizontal
                       overflow is handled here. */
                    : <div className={"overflow-x-auto"}>
                        <table className="appearance-none min-w-full">
                            <thead className={"bg-gray-50 border-y"}>
                            <tr className={"text-xs font-medium text-gray-900 text-left"}>
                                <th scope="col" className={"w-[26px] pl-2 py-1.5"}></th>
                                <th scope="col" className={cell}>Subscription</th>
                                <th scope="col" className={cell}>Group</th>
                                <th scope="col" className={cell}>Used</th>
                                <th scope="col" className={cell}>Last retry</th>
                                <th scope="col" className={cell}>Alert</th>
                                <th scope="col" className={cell}>Set by</th>
                                <th scope="col" className={cell}>Alerted</th>
                                <th scope="col" className={cell}></th>
                            </tr>
                            </thead>
                            <tbody className={"text-xs"}>
                            {visible.map((r) => {
                                const rowKey = keyOf(r)
                                const open = openKey === rowKey
                                return <React.Fragment key={rowKey}>
                                <tr className="bg-white border-b">
                                    {/* What the spent budget went on, one row at a time. Shown on
                                        every row, including ones with nothing spent: a reset drops
                                        the counter but not the failures, so "nothing spent" is no
                                        promise that there is nothing to see. */}
                                    <td className={"pl-2 py-1.5 align-top"}>
                                        <button type="button" aria-expanded={open}
                                                title={open ? "Hide failures" : "Show failures"}
                                                className={"text-gray-500 hover:text-gray-900 align-middle"}
                                                onClick={() => setOpenKey(open ? undefined : rowKey)}>
                                            {open ? <MdExpandMore size={16}/> : <MdChevronRight size={16}/>}
                                        </button>
                                    </td>
                                    <td className={`${cell} text-gray-900 font-semibold`}>
                                        {r.subscriptionName}
                                    </td>
                                    <td className={`${cell} text-gray-900`}>{r.groupName}</td>
                                    <td className={cell}>
                                        <span className={r.exhausted ? "text-red-600 font-semibold" : "text-gray-900"}>
                                            {r.attemptsUsed} / {r.maxAttemptsTotal}
                                        </span>
                                        {r.exhausted &&
                                            <span className={"ml-2 inline-block bg-red-100 text-red-700 rounded px-1.5 py-0.5"}>
                                                Exhausted
                                            </span>}
                                    </td>
                                    <td className={`${cell} text-gray-600`}>
                                        {r.lastAttemptOn
                                            ? dayjs(r.lastAttemptOn).format("YYYY-MM-DD HH:mm")
                                            : <span className={"text-gray-400 italic"}>never failed</span>}
                                    </td>
                                    <td className={cell}>
                                        {r.resolvedHandlerId
                                            ? <span className={"font-mono text-gray-900"}>{r.resolvedHandlerId}</span>
                                            : <span className={"text-amber-700"}>Nothing</span>}
                                    </td>
                                    <td className={cell}>
                                        {r.resolvedFrom
                                            ? <span className={"inline-block bg-gray-100 border rounded px-1.5 py-0.5 text-gray-700"}>
                                                {retryAlertLevelLabels[r.resolvedFrom]}
                                              </span>
                                            : r.silencedAt
                                                ? <span className={"text-gray-600"}>{silenceLabels[r.silencedAt]}</span>
                                                : <span className={"text-gray-400 italic"}>Not configured</span>}
                                    </td>
                                    {/* Exhausted with a handler but no alert time is worth calling
                                        out: either it ran out before alerts existed, or the alert
                                        never got raised. */}
                                    <td className={cell}>
                                        {r.exhaustedNotifiedOn
                                            ? <span className={"text-gray-600"}>
                                                {dayjs(r.exhaustedNotifiedOn).format("YYYY-MM-DD HH:mm")}
                                              </span>
                                            : r.exhausted && r.resolvedHandlerId
                                                ? <span className={"text-amber-700"}>never alerted</span>
                                                : <span className={"text-gray-400"}>—</span>}
                                    </td>
                                    <td className={`${cell} text-right`}>
                                        <Authorize roles={["Admin", "Member"]}>
                                            {/* Text links, not the standard Button: its min-height
                                                and margins set the row height, and chunky buttons on
                                                every row cost more vertical space than the rows
                                                themselves. Labels stay spelled out — the icon-only
                                                actions used elsewhere are guesswork to a reader. */}
                                            <div className={"flex flex-row justify-end gap-3"}>
                                                {/* Nothing to clear until the pair has actually failed. */}
                                                {r.lastAttemptOn &&
                                                    <Button variant={"none"}
                                                            className={"text-primary-600 hover:underline"}
                                                            onClick={() => reset({
                                                                id: policyId,
                                                                subscriptionId: r.subscriptionId,
                                                                groupId: r.groupId
                                                            })}>
                                                        Reset
                                                    </Button>}
                                                <Button variant={"none"}
                                                        className={"text-primary-600 hover:underline"}
                                                        onClick={() => onEdit(r)}>
                                                    Override
                                                </Button>
                                            </div>
                                        </Authorize>
                                    </td>
                                </tr>
                                {open &&
                                    <tr className={"bg-gray-50 border-b"}>
                                        <td colSpan={9} className={"px-3 py-2 text-xs"}>
                                            <RetryGroupAttempts policyId={policyId}
                                                                subscriptionId={r.subscriptionId}
                                                                groupId={r.groupId}/>
                                        </td>
                                    </tr>}
                                </React.Fragment>
                            })}
                            </tbody>
                        </table>
                    </div>}

                <div className={"flex flex-row items-center justify-between gap-3 flex-wrap"}>
                    {/* Counts the filtered set, not every row, so "total" matches what is listed. */}
                    <DataListViewSettingsEditor total={matching.length}
                                                offset={view.offset} limit={view.limit}
                                                onChange={(e) => setView({offset: e.offset, limit: e.limit})}/>
                    <Authorize roles={["Admin", "Member"]}>
                        <Button variant={"secondary"} onClick={() => reset({id: policyId})}>
                            Reset all
                        </Button>
                    </Authorize>
                </div>
            </div>}
        </FormField>
    );
}

export default RetryPolicySubscriptions;
