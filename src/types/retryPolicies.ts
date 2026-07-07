import {OptionType} from "./common";

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
}

export interface RetryPolicyModel {
    id?: number
    name: string
    groups: RetryGroup[]
}

export interface RetryPolicyRow {
    id: number
    name: string
    groupCount: number
}

export interface RetryPoliciesSearchModel {
    limit?: number
    offset?: number
}

export interface CustomRetryPolicy {
    groups: RetryGroup[]
}

export const matcherTypeOptions: OptionType[] = [
    {id: "contains", title: "Contains"},
    {id: "regex", title: "Regex"},
    {id: "exceptionType", title: "Exception type"},
    {id: "jsonPath", title: "JSON path"},
]

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
