import {CommonFindQuery, KeyValuePair, OptionType} from "./common";


export type SubscriptionFindQuery = CommonFindQuery & {
    nameContains: string
    rawsubscriptionproperties?: string
    rawfiltersproperties?: string
    partnerId?: number | string
}

export interface ISubscription {
    categoryId?: number
    categoryCode?: string
    categoryDescription?: string
    id?: number
    name?: string;
    documentId?: string;
    partnerId?: string;
    aggregationForId?: string;
    type?: string
    documentName?: string;
    isRunning?: boolean;
    handlerId?: string;
    mapperId?: string;
    receiverId?: string;
    validatorId?: string;
    temporary?: boolean;
    handlerProperties?: KeyValuePair[];
    validatorProperties?: KeyValuePair[];
    mapperProperties?: KeyValuePair[];
    receiverProperties?: KeyValuePair[];
    inactive?: boolean;
    schedules?: Array<ScheduleView>;
    responseSubscriptionId?: number | null;
    responseMessageTypeName?: string;
    receiveOn?: string | null;
    aggregateOn?: string | null;
    consecutiveFailures?: number;
    lastException?: string;
    aggregationTarget?: string;
    pausedOn?: string | null;
    documentFilter?: Array<KeyValuePair>
    matchExpressionAsString?: string
    matchExpression?: MatchExpression
}

export interface ScheduleView {
    recurrence: string;
    days: number;
    hours: number;
    minutes: number;
    backwards: boolean;
    id: number
}

export interface ICreateSubscription {
    type?: string;
    name?: string;
    documentId?: string;
    partnerId?: string;
    aggregationForId?: string;
}

export interface IDuplicateSubscription {
    type: string;
    documentId: string;
    id?: number
    name: string
}


export type AndMatchExpression = {
    type: "and"

    left: MatchExpression

    right: MatchExpression
}

export type OrMatchExpression = {
    type: "or"

    left: MatchExpression

    right: MatchExpression
}

export type OneOfMatchExpression = {
    type: "one_of"
    path: string
    values: Array<string>
}

export type NotOneOfMatchExpression = {
    type: "not_one_of"
    path: string
    values: Array<string>
}

export type MatchExpressionValue = {
    type: "one_of" | "not_one_of"
    path: string
    values: Array<string>
}

export type MatchExpressionBranch = {
    type: "and" | "or"
    left: MatchExpression | MatchExpressionValue,
    right: MatchExpression | MatchExpressionValue
}

export type MatchExpression =
    AndMatchExpression
    | OrMatchExpression
    | OneOfMatchExpression
    | NotOneOfMatchExpression
    | MatchExpressionValue

export const SubscriptionTypeOptions: OptionType[] = [{
    id: "0",
    title: "Unknown"
},
    {id: "1", title: "Internal"},
    {id: "2", title: "ApiCall"},
    {id: "4", title: "Receiving"},
    {id: "8", title: "Aggregation"}]

export interface AdapterFindQuery {
    prefix: string;
}


export type SubscriptionCategoryModel = {
    id: number;
    code: string;
    description: string;
    createdOn: Date;
};

export type CreateSubscriptionCategoryModel = {
    code: string;
    description: string;
};

export type SearchSubscriptionCategoryModel = {
    limit?: number;
    offset?: number;
};

export type UpdateSubscriptionCategoryModel = { id: number } & CreateSubscriptionCategoryModel;

export type DeleteSubscriptionCategoryModel = { id: number };