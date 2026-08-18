import {KeyValuePair, OptionType} from "./common";

export enum XchangeResultType {
    Success = "Success",
    Error = "Error",
    BadResult = "BadResult",
}

export enum RetryAction {
    Allow = "Allow",
    Block = "Block",
}

export enum JsonPathOp {
    Eq = "Eq",
    Neq = "Neq",
    Contains = "Contains",
    Regex = "Regex",
    Exists = "Exists",
    NotExists = "NotExists",
}

export type ContainsMatcher = {
    type: "contains"
    value: string
    caseSensitive?: boolean
}

export type RegexMatcher = {
    type: "regex"
    pattern: string
    flags?: string
}

export type ExceptionTypeMatcher = {
    type: "exceptionType"
    value: string
    includeInner?: boolean
}

export type JsonPathMatcher = {
    type: "jsonPath"
    path: string
    op: JsonPathOp
    value?: string
}

export type Matcher = ContainsMatcher | RegexMatcher | ExceptionTypeMatcher | JsonPathMatcher

export type FixedDelayStrategy = {
    type: "fixed"
    delayMs: number
}

export type LinearDelayStrategy = {
    type: "linear"
    initialDelayMs: number
    incrementMs: number
}

export type ExponentialDelayStrategy = {
    type: "exponential"
    initialDelayMs: number
    multiplier?: number
    maxDelayMs?: number
}

export type DelayStrategy = FixedDelayStrategy | LinearDelayStrategy | ExponentialDelayStrategy

export interface RetryBudget {
    maxAttemptsPerError: number
    maxAttemptsTotal: number
    delayStrategy: DelayStrategy
}

// Whether a level of the alert hierarchy defines its own destination for budget-exhausted
// alerts or defers upward. An overriding level REPLACES the level above it rather than merging,
// so whichever level wins must carry the handler and all of its properties.
export enum RetryAlertMode {
    Inherit = "Inherit",
    Send = "Send",
    Silent = "Silent",
}

// Which level of the hierarchy decided where an alert goes.
export enum RetryAlertLevel {
    SubscriptionGroup = "SubscriptionGroup",
    Group = "Group",
    Policy = "Policy",
}

export interface RetryGroup {
    id?: string
    name: string
    priority: number
    enabled?: boolean
    appliesTo: XchangeResultType[]
    matchers: Matcher[]
    action?: RetryAction
    budget?: RetryBudget | null
    notes?: string | null
    alertMode?: RetryAlertMode
    alertHandlerId?: string | null
    alertHandlerProperties?: Record<string, string> | null
}

export interface RetryPolicyModel {
    id?: number
    name: string
    groups: RetryGroup[]
    // The policy default, inherited by every group that does not override it.
    alertHandlerId?: string | null
    alertHandlerProperties?: Record<string, string> | null
}

export interface RetryPolicyRow {
    id: number
    name: string
    groupCount: number
}

// The whole state of one subscription-and-group pair under a policy: what it has spent of the
// group's "max attempts total", and where its budget-exhausted alert goes. Both halves are keyed by
// the same pair, so they belong on one row — the question asked about an exhausted budget is
// whether anyone was told, and splitting that leaves the reader matching two tables by eye.
//
// Every pair gets a row, including subscriptions that have never failed, because an alert override
// has to be settable before the first failure. Groups that cannot exhaust a budget (Block, or no
// budget at all) are left out — they can never alert, so offering to configure one would mislead.
export interface RetryGroupUsageRow {
    subscriptionId: number
    subscriptionName: string
    groupId: string
    groupName: string
    attemptsUsed: number
    maxAttemptsTotal: number
    exhausted: boolean
    // Null when this pair has never failed — which is also how we know it has no counter to reset.
    lastAttemptOn?: string | null
    // When the alert was raised. Null while the budget still has room — or when it ran out before
    // alerts existed. Delivery success is recorded separately, on the exchange's notifications.
    exhaustedNotifiedOn?: string | null
    // This pair's own override mode. "Inherit" when no override exists.
    alertMode: RetryAlertMode
    overrideHandlerId?: string | null
    overrideHandlerProperties?: Record<string, string> | null
    // Where the alert actually goes, and which level decided that. Null when nothing sends.
    resolvedHandlerId?: string | null
    // The winning level's own settings, so an override can start from what is currently sent.
    resolvedHandlerProperties?: Record<string, string> | null
    resolvedFrom?: RetryAlertLevel | null
    // Which level switched the alert off, when one did. Nothing resolving and something being
    // deliberately silenced look identical otherwise, and one is a decision, the other an oversight.
    silencedAt?: RetryAlertLevel | null
}

export interface RetryPolicyResetUsage {
    subscriptionId?: number
    groupId?: string
}

export interface RetryAlertOverrideSave {
    subscriptionId: number
    groupId: string
    alertMode: RetryAlertMode
    alertHandlerId?: string | null
    alertHandlerProperties?: Record<string, string> | null
}

export const retryAlertModeOptions: OptionType[] = [
    {id: RetryAlertMode.Inherit, title: "Inherit"},
    {id: RetryAlertMode.Send, title: "Send via…"},
    {id: RetryAlertMode.Silent, title: "Silent"},
]

export const retryAlertLevelLabels: Record<RetryAlertLevel, string> = {
    [RetryAlertLevel.SubscriptionGroup]: "This subscription",
    [RetryAlertLevel.Group]: "Group",
    [RetryAlertLevel.Policy]: "Policy",
}

// AdapterEditor works in {key, value} pairs while the API stores a plain object, so convert
// at that boundary rather than storing pairs and having to explain the shape everywhere else.
export const pairsFromRecord = (record?: Record<string, string> | null): KeyValuePair[] =>
    Object.entries(record ?? {}).map(([key, value]) => ({key, value}));

export const recordFromPairs = (pairs?: KeyValuePair[]): Record<string, string> =>
    Object.fromEntries((pairs ?? []).map(p => [p.key, p.value]));

export interface RetryPoliciesSearchModel {
    limit?: number
    offset?: number
}

export interface CustomRetryPolicy {
    groups: RetryGroup[]
}

export interface TestRetryPolicyRequest {
    groups: RetryGroup[]
    resultType: XchangeResultType.Error | XchangeResultType.BadResult
    content: string
    attemptsToSimulate: number
}

export interface TestRetryAttemptResult {
    attemptNumber: number
    matchedGroupName?: string | null
    shouldRetry: boolean
    delaySeconds?: number | null
    reason: string
}

export interface TestRetryPolicyResponse {
    attempts: TestRetryAttemptResult[]
}

export const matcherTypeOptions: OptionType[] = [
    {id: "contains", title: "Contains"},
    {id: "regex", title: "Regex"},
    {id: "exceptionType", title: "Exception type"},
    {id: "jsonPath", title: "JSON path"},
]

// Which failure content each matcher type can be evaluated against — mirrors Matcher.Supports()
// on the backend. A matcher that supports none of the group's "applies to" types can never
// fire, and the backend rejects the group on save.
export const matcherTypeSupport: Record<Matcher["type"], XchangeResultType[]> = {
    contains: [XchangeResultType.Error, XchangeResultType.BadResult],
    regex: [XchangeResultType.Error, XchangeResultType.BadResult],
    exceptionType: [XchangeResultType.Error],
    jsonPath: [XchangeResultType.BadResult],
}

export const matcherTypeOptionsFor = (appliesTo: XchangeResultType[]): OptionType[] => {
    const resultTypes = appliesTo?.length ? appliesTo : [XchangeResultType.Error, XchangeResultType.BadResult];
    return matcherTypeOptions.filter(o =>
        matcherTypeSupport[o.id as Matcher["type"]].some(t => resultTypes.includes(t)));
}

export const delayStrategyTypeOptions: OptionType[] = [
    {id: "fixed", title: "Fixed"},
    {id: "linear", title: "Linear"},
    {id: "exponential", title: "Exponential"},
]

export const resultTypeOptions: OptionType[] = [
    {id: XchangeResultType.Error, title: "Error"},
    {id: XchangeResultType.BadResult, title: "Bad result"},
]

export const retryActionOptions: OptionType[] = [
    {id: RetryAction.Allow, title: "Allow"},
    {id: RetryAction.Block, title: "Block"},
]

export const jsonPathOpOptions: OptionType[] = [
    {id: JsonPathOp.Eq, title: "Equals"},
    {id: JsonPathOp.Neq, title: "Not equals"},
    {id: JsonPathOp.Contains, title: "Contains"},
    {id: JsonPathOp.Regex, title: "Regex"},
    {id: JsonPathOp.Exists, title: "Exists"},
    {id: JsonPathOp.NotExists, title: "Not exists"},
]
