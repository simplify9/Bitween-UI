import {CommonFindQuery, KeyValuePair, OptionType} from "./common";

export enum SubscriptionType {
    Unknown = 0,
    Internal = 1,
    ApiCall = 2,
    Receiving = 4,
    Aggregation = 8,
    GatewayApiCall = 16,
}

export const SubscriptionTypes = [
    {label: 'Internal', value: SubscriptionType.Internal},
    {label: 'ApiCall', value: SubscriptionType.ApiCall},
    {label: 'Receiving', value: SubscriptionType.Receiving},
    {label: 'Aggregation', value: SubscriptionType.Aggregation},
    {label: 'GatewayApiCall', value: SubscriptionType.GatewayApiCall},
]


export type SubscriptionFindQuery = CommonFindQuery & {
    nameContains: string
    rawsubscriptionproperties?: string
    rawfiltersproperties?: string
    partnerId?: number | null | string
    id: number | null
    type: number | null
    mapperId: string | null
    handlerId: string | null
    validatorId: string | null
    receiverId: string | null
    isRunning: boolean | null
    categoryId: number | null | undefined
    workGroupId: number | null | undefined
    inactive: boolean | null
    documentId: number | null
}

export type SubscriptionSearchQuery = CommonFindQuery & {
    nameContains: string
    rawsubscriptionproperties?: string
    rawfiltersproperties?: string
    partnerId?: number | string
}

export interface ISubscription {
    categoryId?: number
    categoryCode?: string
    categoryDescription?: string
    workGroupId?: number
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
    recurrence: number;
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

export const SubscriptionTypeOptions: OptionType[] = [
    {id: String(SubscriptionType.Internal), title: "Internal"},
    {id: String(SubscriptionType.ApiCall), title: "ApiCall"},
    {id: String(SubscriptionType.Receiving), title: "Receiving"},
    {id: String(SubscriptionType.Aggregation), title: "Aggregation"},
    {id: String(SubscriptionType.GatewayApiCall), title: "GatewayApiCall"},
]

export interface AdapterFindQuery {
    prefix: string;
}

export interface Adapter {
    key: string
    versions: Version[]
}

export interface Version {
    key: string
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

// WorkGroup Types
export type ConsumerSettings = {
    prefetch?: number;
    priority?: number;
};

export type WorkGroupOptions = {
    rabbitMqOptions?: ConsumerSettings;
};

export type WorkGroupModel = {
    id: number;
    name: string;
    busMessageName: string;
    options?: WorkGroupOptions;
    processorAckRate?: number;
    processorIncomingRate?: number;
    processorProcessingCount?: number;
    processorQueueCount?: number;
    notifierAckRate?: number;
    notifierIncomingRate?: number;
    notifierProcessingCount?: number;
    notifierQueueCount?: number;
};

export type CreateWorkGroupModel = {
    name: string;
    busMessageName: string;
    options?: WorkGroupOptions;
};

export type SearchWorkGroupModel = {
    limit?: number;
    offset?: number;
};

export type UpdateWorkGroupModel = { id: number } & CreateWorkGroupModel;

export type DeleteWorkGroupModel = { id: number };

